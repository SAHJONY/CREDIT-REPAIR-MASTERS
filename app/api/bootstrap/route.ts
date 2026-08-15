import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { authenticateOperator } from "@/lib/api-auth";
import { getPlatformStore } from "@/lib/platform-store";

export async function POST(request: NextRequest) {
  const auth = authenticateOperator(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const store = getPlatformStore();
    const existing = await store.getOrganization(auth.organizationId);
    if (existing) {
      return NextResponse.json({ organization: existing, created: false, mode: auth.mode });
    }

    const organization = await store.upsertOrganization({
      id: auth.organizationId,
      name: "CREDIT REPAIR MASTERS",
      mode: auth.mode === "demo" ? "demo" : "production",
      createdAt: new Date().toISOString()
    });

    await store.appendAudit(auth.organizationId, {
      id: `audit_${randomUUID()}`,
      organizationId: auth.organizationId,
      actorType: "user",
      actorId: auth.actorId,
      action: "organization.bootstrap",
      resourceType: "organization",
      resourceId: organization.id,
      decision: "allowed",
      metadata: { mode: organization.mode },
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ organization, created: true, mode: auth.mode }, { status: 201 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "BOOTSTRAP_FAILED";
    return NextResponse.json({ error: code }, { status: 503 });
  }
}
