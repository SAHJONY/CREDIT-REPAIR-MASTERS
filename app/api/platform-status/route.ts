import { NextRequest, NextResponse } from "next/server";
import { authenticateOperator } from "@/lib/api-auth";
import { getPlatformStore, storageMode } from "@/lib/platform-store";

export async function GET(request: NextRequest) {
  const auth = authenticateOperator(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const mode = storageMode();
  try {
    const store = getPlatformStore();
    const [org, users, clients, audit, agentRuns] = await Promise.all([
      store.getOrganization(auth.organizationId),
      store.listUsers(auth.organizationId),
      store.listClients(auth.organizationId),
      store.listAudit(auth.organizationId, 20),
      store.listAgentRuns(auth.organizationId, 20)
    ]);
    return NextResponse.json({
      version: "1.3.0-hardening",
      mode,
      organization: org,
      rbacUsers: users.map(({ id, role, status }) => ({ id, role, status })),
      clientCount: clients.length,
      auditCount: audit.length,
      agentRunCount: agentRuns.length,
      persistenceConfigured: mode === "neon-postgres",
      productionPersistenceActive: mode === "neon-postgres",
      organizationScope: auth.organizationId,
      authMode: auth.mode,
      healthEndpoint: "/api/storage-health"
    });
  } catch (error) {
    return NextResponse.json({
      version: "1.3.0-hardening",
      mode,
      organizationScope: auth.organizationId,
      persistenceConfigured: mode === "neon-postgres",
      productionPersistenceActive: false,
      error: error instanceof Error ? error.message : "PLATFORM_STATUS_UNAVAILABLE"
    }, { status: 503 });
  }
}
