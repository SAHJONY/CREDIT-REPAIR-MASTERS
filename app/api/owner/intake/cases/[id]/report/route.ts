import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticateBusinessUser, authorizeRoles } from "@/lib/api-auth";
import { uploadPrivateEvidence, evidenceVaultConfigured } from "@/lib/evidence-vault";
import { attachReport, getIntakeCase, describePipelineState } from "@/lib/owner-intake";

const INTAKE_CONTENT_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);

const schema = z.object({
  ssnAttestation: z.enum(["true", "false"]),
});

/**
 * POST — attach a credit report to an existing intake case.
 * Owner/admin only. Requires ssnAttestation=true (the owner confirms the SSN
 * was redacted, or the customer consented to share it unredacted). The file
 * is stored opaquely in the private vault and never parsed.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = authorizeRoles(await authenticateBusinessUser(request), ["owner", "admin"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  if (!evidenceVaultConfigured()) {
    return NextResponse.json({ error: "EVIDENCE_VAULT_NOT_CONFIGURED" }, { status: 503 });
  }

  const { id } = await params;
  const existing = getIntakeCase(id, auth.organizationId);
  if (!existing) return NextResponse.json({ error: "INTAKE_CASE_NOT_FOUND" }, { status: 404 });

  const form = await request.formData();
  const parsed = schema.safeParse({ ssnAttestation: form.get("ssnAttestation") });
  if (!parsed.success) return NextResponse.json({ error: "INVALID_INTAKE_FIELDS" }, { status: 400 });

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "INTAKE_FILE_REQUIRED" }, { status: 400 });
  }
  if (!INTAKE_CONTENT_TYPES.has(file.type)) {
    return NextResponse.json({ error: "INTAKE_FILE_TYPE_NOT_ALLOWED" }, { status: 400 });
  }

  try {
    const uploaded = await uploadPrivateEvidence({
      organizationId: auth.organizationId,
      clientId: id,
      file,
    });
    const updated = attachReport(id, {
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
      { case: { ...updated, pipeline: describePipelineState(updated, "es") } },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "INTAKE_ATTACH_FAILED";
    const code = message.split(":")[0] || "INTAKE_ATTACH_FAILED";
    const http =
      code === "INTAKE_SSN_ATTESTATION_REQUIRED" || code === "SSN_LIKE_PATTERN_REJECTED" ? 400 : 500;
    // Best effort: the vault upload already happened; the metadata record failed.
    // The orphaned blob is private and unreferenced — surface the failure plainly.
    return NextResponse.json({ error: code, detail: message }, { status: http });
  }
}
