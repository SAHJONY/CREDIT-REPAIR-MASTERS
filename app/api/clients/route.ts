import { NextRequest, NextResponse } from "next/server";
import { authenticateOperator } from "@/lib/api-auth";
import { getPlatformStore } from "@/lib/platform-store";

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
