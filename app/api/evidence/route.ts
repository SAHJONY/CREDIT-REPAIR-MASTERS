import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticateOperator } from "@/lib/api-auth";
import { getPlatformStore } from "@/lib/platform-store";

const evidenceSchema = z.object({
  clientId: z.string().trim().min(3).max(160),
  caseId: z.string().trim().min(3).max(160).optional(),
  type: z.enum(["credit_report", "statement", "payment_record", "identity_document", "correspondence", "other"]),
  label: z.string().trim().min(2).max(240),
  sha256: z.string().regex(/^[a-fA-F0-9]{64}$/).optional(),
  vaultRef: z.string().trim().min(3).max(500).optional()
});

export async function POST(request: NextRequest) {
  const auth = authenticateOperator(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const parsed = evidenceSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "INVALID_EVIDENCE_PAYLOAD", issues: parsed.error.flatten() }, { status: 400 });

    const store = getPlatformStore();
    const client = await store.getClient(auth.organizationId, parsed.data.clientId);
    if (!client) return NextResponse.json({ error: "CLIENT_NOT_FOUND" }, { status: 404 });

    const now = new Date().toISOString();
    const record = {
      id: `evidence_${randomUUID()}`,
      organizationId: auth.organizationId,
      clientId: client.id,
      caseId: parsed.data.caseId,
      type: parsed.data.type,
      label: parsed.data.label,
      sha256: parsed.data.sha256?.toLowerCase(),
      vaultRef: parsed.data.vaultRef,
      verification: "unverified" as const,
      createdAt: now
    };

    await store.appendEvidence(auth.organizationId, record);
    await store.appendAudit(auth.organizationId, {
      id: `audit_${randomUUID()}`,
      organizationId: auth.organizationId,
      actorType: "user",
      actorId: auth.actorId,
      action: "evidence.intake",
      resourceType: "evidence",
      resourceId: record.id,
      decision: "allowed",
      metadata: { clientId: client.id, type: record.type, verification: record.verification, vaultLinked: Boolean(record.vaultRef), checksumPresent: Boolean(record.sha256) },
      createdAt: now
    });

    return NextResponse.json({ evidence: record, note: "Evidence is always ingested as unverified and must pass a separate verification process before it can support a dispute." }, { status: 201 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "EVIDENCE_CREATE_FAILED";
    return NextResponse.json({ error: code }, { status: 503 });
  }
}
