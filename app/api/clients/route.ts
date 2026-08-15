import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticateOperator } from "@/lib/api-auth";
import { getPlatformStore } from "@/lib/platform-store";

const createClientSchema = z.object({
  displayName: z.string().trim().min(2).max(120),
  kind: z.enum(["consumer", "business"]).default("consumer"),
  state: z.string().trim().length(2).transform((value) => value.toUpperCase()),
  status: z.enum(["onboarding", "active", "paused", "closed"]).default("onboarding")
});

export async function GET(request: NextRequest) {
  const auth = authenticateOperator(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const store = getPlatformStore();
    const clients = await store.listClients(auth.organizationId);
    return NextResponse.json({ mode: auth.mode, organizationId: auth.organizationId, clients });
  } catch (error) {
    const code = error instanceof Error ? error.message : "PLATFORM_STORE_UNAVAILABLE";
    return NextResponse.json({ error: code }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const auth = authenticateOperator(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = createClientSchema.safeParse(await request.json());
    if (!body.success) return NextResponse.json({ error: "INVALID_CLIENT_PAYLOAD", issues: body.error.flatten() }, { status: 400 });

    const store = getPlatformStore();
    const organization = await store.getOrganization(auth.organizationId);
    if (!organization) return NextResponse.json({ error: "ORGANIZATION_NOT_BOOTSTRAPPED" }, { status: 409 });

    const now = new Date().toISOString();
    const client = await store.upsertClient(auth.organizationId, {
      id: `client_${randomUUID()}`,
      organizationId: auth.organizationId,
      displayName: body.data.displayName,
      kind: body.data.kind,
      state: body.data.state,
      status: body.data.status,
      createdAt: now,
      updatedAt: now
    });

    await store.appendAudit(auth.organizationId, {
      id: `audit_${randomUUID()}`,
      organizationId: auth.organizationId,
      actorType: "user",
      actorId: auth.actorId,
      action: "client.create",
      resourceType: "client",
      resourceId: client.id,
      decision: "allowed",
      metadata: { kind: client.kind, state: client.state, status: client.status },
      createdAt: now
    });

    return NextResponse.json({ organizationId: auth.organizationId, client }, { status: 201 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "CLIENT_CREATE_FAILED";
    return NextResponse.json({ error: code }, { status: 503 });
  }
}
