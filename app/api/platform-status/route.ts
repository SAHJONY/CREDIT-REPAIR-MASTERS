import { NextResponse } from "next/server";
import { getPlatformStore, storageMode } from "@/lib/platform-store";

export async function GET() {
  const store = getPlatformStore();
  const mode = storageMode();
  const [org, users, clients, audit, agentRuns] = await Promise.all([
    store.getOrganization("org_demo").catch(() => null),
    store.listUsers("org_demo").catch(() => []),
    store.listClients("org_demo").catch(() => []),
    store.listAudit("org_demo", 20).catch(() => []),
    store.listAgentRuns("org_demo", 20).catch(() => [])
  ]);
  return NextResponse.json({
    version: "0.8.0",
    mode,
    organization: org,
    rbacUsers: users.map(({ id, role, status }) => ({ id, role, status })),
    clientCount: clients.length,
    auditCount: audit.length,
    agentRunCount: agentRuns.length,
    persistenceConfigured: mode === "neon-postgres",
    productionPersistenceActive: false,
    healthEndpoint: "/api/storage-health"
  });
}
