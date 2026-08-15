import { NextResponse } from "next/server";
import { getNeonAuth, neonAuthConfigured } from "@/lib/auth/server";

function unavailable() {
  return NextResponse.json({ error: "NEON_AUTH_NOT_CONFIGURED" }, { status: 503 });
}

export async function GET(request: Request) {
  if (!neonAuthConfigured()) return unavailable();
  const handler = getNeonAuth().handler();
  return handler.GET(request);
}

export async function POST(request: Request) {
  if (!neonAuthConfigured()) return unavailable();
  const handler = getNeonAuth().handler();
  return handler.POST(request);
}
