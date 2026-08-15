import { NextRequest, NextResponse } from "next/server";
import { authenticateOperator } from "@/lib/api-auth";
import { getPlatformStore } from "@/lib/platform-store";

export async function GET(request: NextRequest) {
  const auth = authenticateOperator(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const store = getPlatformStore();
    const [audit, agentRuns] = await Promise.all([
      store.listAudit(auth.organizationId, 100),
      store.listAgentRuns(auth.organizationId, 100)
    ]);
    return NextResponse.json({ mode: auth.mode, organizationId: auth.organizationId, audit, agentRuns });
  } catch (error) {
    const code = error instanceof Error ? error.message : "PLATFORM_STORE_UNAVAILABLE";
    return NextResponse.json({ error: code }, { status: 503 });
  }
}
