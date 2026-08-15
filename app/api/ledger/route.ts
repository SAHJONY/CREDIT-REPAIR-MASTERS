import { NextResponse } from "next/server";
import { getPlatformStore } from "@/lib/platform-store";

export async function GET() {
  const store = getPlatformStore();
  const [audit, agentRuns] = await Promise.all([
    store.listAudit("org_demo", 100),
    store.listAgentRuns("org_demo", 100)
  ]);
  return NextResponse.json({ mode: "demo-safe", audit, agentRuns });
}
