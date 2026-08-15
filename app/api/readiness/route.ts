import { NextResponse } from "next/server";
import { getReadinessChecks, readinessSummary } from "@/lib/readiness";

export async function GET() {
  const checks = getReadinessChecks();
  const summary = readinessSummary(checks);
  const mode = summary.productionReady ? "production-ready" : "controlled-live";
  return NextResponse.json({ mode, ...summary, checks }, { status: summary.productionReady ? 200 : 503 });
}
