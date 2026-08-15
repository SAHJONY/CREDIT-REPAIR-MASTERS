import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticateBusinessUser, authorizeRoles } from "@/lib/api-auth";
import { uploadPrivateEvidence } from "@/lib/evidence-vault";
import { getPlatformStore } from "@/lib/platform-store";

const fieldsSchema = z.object({
  clientId: z.string().trim().min(3).max(160),
  caseId: z.string().trim().min(3).max(160).optional(),
  type: z.enum(["credit_report", "statement", "payment_record", "identity_document", "correspondence", "other"]),
  label: z.string().trim().min(2).max(240)
});

export async function POST(request: NextRequest) {
  const auth = authorizeRoles(
    await authenticateBusinessUser(request),
    ["owner", "admin", "credit_specialist", "compliance_reviewer"]
  );
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  let uploaded: Awaited<ReturnType<typeof uploadPrivateEvidence>> | null = null;

  try {
    const form = await request.formData();
    const parsed = fieldsSchema.safeParse({
      clientId: form.get("clientId"),
      caseId: form.get("caseId") || undefined,
      type: form.get("type"),
      label: form.get("label")
    });
    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_EVIDENCE_UPLOAD_FIELDS", issues: parsed.error.flatten() }, { status: 400 });
    }

    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "EVIDENCE_FILE_REQUIRED" }, { status: 400 });

    const store = getPlatformStore();
    const client = await store.getClient(auth.organizationId, parsed.data.clientId);
    if (!client) return NextResponse.json({ error: "CLIENT_NOT_FOUND" }, { status: 404 });

    uploaded = await uploadPrivateEvidence({ organizationId: auth.organizationId, clientId: client.id, file });
    const now = new Date().toISOString();
    const record = {
      id: `evidence_${randomUUID()}`,
      organizationId: auth.organizationId,
      clientId: client.id,
      caseId: parsed.data.caseId,
      type: parsed.data.type,
      label: parsed.data.label,
      sha256: uploaded.sha256,
      vaultRef: uploaded.pathname,
      verification: "unverified" as const,
      createdAt: now
    };

    await store.appendEvidence(auth.organizationId, record);
    await store.appendAudit(auth.organizationId, {
      id: `audit_${randomUUID()}`,
      organizationId: auth.organizationId,
      actorType: "user",
      actorId: auth.actorId,
      action: "evidence.private_upload",
      resourceType: "evidence",
      resourceId: record.id,
      decision: "allowed",
      metadata: {
        clientId: client.id,
        type: record.type,
        verification: record.verification,
        bytes: uploaded.size,
        contentType: uploaded.contentType,
        checksumPresent: true,
        privateVault: true
      },
      createdAt: now
    });

    return NextResponse.json({
      evidence: record,
      storage: { private: true, pathname: uploaded.pathname },
      note: "Uploaded evidence remains unverified until a separate verification step approves it."
    }, { status: 201 });
  } catch (error) {
    if (uploaded) {
      try { await uploaded.cleanup(); } catch { /* best-effort orphan cleanup */ }
    }
    const code = error instanceof Error ? error.message : "EVIDENCE_UPLOAD_FAILED";
    const status = code.startsWith("EVIDENCE_FILE_") ? 400 : code === "EVIDENCE_VAULT_NOT_CONFIGURED" ? 503 : 503;
    return NextResponse.json({ error: code }, { status });
  }
}
