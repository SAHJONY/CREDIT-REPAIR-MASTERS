import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticateOperator } from "@/lib/api-auth";
import { getPlatformStore } from "@/lib/platform-store";

const consentSchema = z.object({
  clientId: z.string().trim().min(3).max(160),
  scope: z.enum(["credit_report_analysis", "dispute_drafting", "dispute_submission", "financial_action", "new_credit", "identity_theft_workflow"]),
  granted: z.boolean(),
  source: z.enum(["client_portal", "staff_recorded", "api"]).default("staff_recorded"),
  expiresAt: z.string().datetime().optional()
});

export async function POST(request: NextRequest) {
  const auth = authenticateOperator(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const parsed = consentSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "INVALID_CONSENT_PAYLOAD", issues: parsed.error.flatten() }, { status: 400 });

    const store = getPlatformStore();
    const client = await store.getClient(auth.organizationId, parsed.data.clientId);
    if (!client) return NextResponse.json({ error: "CLIENT_NOT_FOUND" }, { status: 404 });

    const now = new Date().toISOString();
    const record = {
      id: `consent_${randomUUID()}`,
      organizationId: auth.organizationId,
      clientId: client.id,
      scope: parsed.data.scope,
      granted: parsed.data.granted,
      source: parsed.data.source,
      grantedAt: now,
      expiresAt: parsed.data.expiresAt
    } as const;

    await store.appendConsent(auth.organizationId, record);
    await store.appendAudit(auth.organizationId, {
      id: `audit_${randomUUID()}`,
      organizationId: auth.organizationId,
      actorType: "user",
      actorId: auth.actorId,
      action: "consent.record",
      resourceType: "consent",
      resourceId: record.id,
      decision: parsed.data.granted ? "allowed" : "blocked",
      metadata: { clientId: client.id, scope: record.scope, source: record.source, granted: record.granted },
      createdAt: now
    });

    return NextResponse.json({ consent: record }, { status: 201 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "CONSENT_CREATE_FAILED";
    return NextResponse.json({ error: code }, { status: 503 });
  }
}
