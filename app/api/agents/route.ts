import { NextResponse } from "next/server";
import { agentRegistry, agentRegistrySummary } from "@/lib/agent-registry";

export async function GET() {
  return NextResponse.json({ version: "0.6.0", summary: agentRegistrySummary(), agents: agentRegistry });
}
