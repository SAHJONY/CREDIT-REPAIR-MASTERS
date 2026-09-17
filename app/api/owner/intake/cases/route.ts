import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticateBusinessUser, authorizeRoles } from "@/lib/api-auth";
import { uploadPrivateEvidence, evidenceVaultConfigured } from "@/lib/evidence-vault";
import {
  createIntakeCase,
  attachReport,
  listIntakeCases,
  describePipelineState,
} from "@/lib/owner-intake";

const INTAKE_CONTENT_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);

const schema = z.object({
  customerName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(20),
  notes: z.string().trim().max(2000).default(""),
  ssnAttestation: z.enum(["true", "false"]).default("false"),
});

/** GET — list intake cases (phones masked). Owner/admin only. */
export async function GET(request: NextRequest) {
  const auth = authorizeRoles(await authenticateBusinessUser(request), ["owner", "admin"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const cases = listIntakeCases(auth.organizationId).map((c) => ({
    ...c,
    pipeline: describePipelineState(c, "es"),
  }));
  return NextResponse.json({ organizationId: auth.organizationId, cases });
}

/**
 * POST — create an intake case, optionally attaching the credit report in the
 * same request (multipart: customerName, phone, notes, ssnAttestation, file?).
 * Owner/admin only. The report file is stored opaquely in the private vault
 * and never parsed — SSNs are never extracted.
 */
export async function POST(request: NextRequest) {
  const auth = authorizeRoles(await authenticateBusinessUser(request), ["owner", "admin"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const form = await request.formData();
  const parsed = schema.safeParse({
    customerName: form.get("customerName"),
    phone: form.get("phone"),
    notes: form.get("notes") ?? "",
    ssnAttestation: form.get("ssnAttestation") ?? "false",
  });
  if (!parsed.success) return NextResponse.json({ error: "INVALID_INTAKE_FIELDS" }, { status: 400 });

  const file = form.get("file");
  const wantsFile = file instanceof File && file.size > 0;
  if (wantsFile && !INTAKE_CONTENT_TYPES.has(file.type)) {
    return NextResponse.json({ error: "INTAKE_FILE_TYPE_NOT_ALLOWED" }, { status: 400 });
  }
  if (wantsFile && !evidenceVaultConfigured()) {
    return NextResponse.json({ error: "EVIDENCE_VAULT_NOT_CONFIGURED" }, { status: 503 });
  }

  try {
    const created = createIntakeCase({
      organizationId: auth.organizationId,
      customerName: parsed.data.customerName,
      phone: parsed.data.phone,
      notes: parsed.data.notes,
      createdBy: auth.actorId,
    });

    if (wantsFile && file instanceof File) {
      const uploaded = await uploadPrivateEvidence({
        organizationId: auth.organizationId,
        clientId: created.id,
        file,
      });
      const withReport = attachReport(created.id, {
        organizationId: auth.organizationId,
        fileName: file.name,
        contentType: file.type,
        sizeBytes: file.size,
        sha256: uploaded.sha256,
        vaultPath: uploaded.pathname,
        attachedBy: auth.actorId,
        ssnRedactionAttested: parsed.data.ssnAttestation === "true",
      });
      return NextResponse.json(
        { case: { ...withReport, pipeline: describePipelineState(withReport, "es") } },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { case: { ...created, pipeline: describePipelineState(created, "es") } },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "INTAKE_CREATE_FAILED";
    const code = message.split(":")[0] || "INTAKE_CREATE_FAILED";
    const status =
      /SSN_LIKE_PATTERN_REJECTED|INTAKE_(NAME|PHONE|NOTES)_/.test(message) ||
      message.includes("INTAKE_SSN_ATTESTATION_REQUIRED")
        ? 400
        : 500;
    return NextResponse.json({ error: code, detail: message }, { status });
  }
}
