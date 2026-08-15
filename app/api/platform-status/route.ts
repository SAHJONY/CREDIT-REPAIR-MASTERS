import { NextResponse } from "next/server";
import { getPlatformStore, storageMode } from "@/lib/platform-store";

export async function GET() {
  const store = getPlatformStore();
  const [org, users, clients, audit, agentRuns] = await Promise.all([
    store.getOrganization("org_demo"),
    store.listUsers("org_demo"),
    store.listClients("org_demo"),
    store.listAudit("org_demo", 20),
    store.listAgentRuns("org_demo", 20)
  ]);
  return NextResponse.json({
    version: "0.5.0",
    mode: storageMode(),
    organization: org,
    rbacUsers: users.map(({ id, role, status }) => ({ id, role, status })),
    clientCount: clients.length,
    auditCount: audit.length,
    agentRunCount: agentRuns.length,
    productionPersistenceActive: false
  });
}
