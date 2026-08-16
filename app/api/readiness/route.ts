import { NextResponse } from "next/server";
import { configuredOrganizationId } from "@/lib/api-auth";
import { resolveProductionReadiness } from "@/lib/production-readiness";

export async function GET() {
  const { checks, summary } = await resolveProductionReadiness(configuredOrganizationId());
  const mode = summary.productionReady ? "production-ready" : "controlled-live";
  return NextResponse.json({ mode, ...summary, checks }, { status: summary.productionReady ? 200 : 503 });
}
