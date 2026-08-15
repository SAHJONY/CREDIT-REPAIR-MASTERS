import { NextResponse } from "next/server";
import { getNeonAuth, neonAuthConfigured } from "@/lib/auth/server";

type AuthRouteContext = { params: Promise<{ path: string[] }> };

function unavailable() {
  return NextResponse.json({ error: "NEON_AUTH_NOT_CONFIGURED" }, { status: 503 });
}

export async function GET(request: Request, context: AuthRouteContext) {
  if (!neonAuthConfigured()) return unavailable();
  const handler = getNeonAuth().handler();
  return handler.GET(request, context);
}

export async function POST(request: Request, context: AuthRouteContext) {
  if (!neonAuthConfigured()) return unavailable();
  const handler = getNeonAuth().handler();
  return handler.POST(request, context);
}
