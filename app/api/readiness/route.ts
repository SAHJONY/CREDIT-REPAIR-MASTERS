import { NextResponse } from "next/server";
import { readinessChecks, readinessSummary } from "@/lib/readiness";

export async function GET() {
  const summary = readinessSummary();
  return NextResponse.json({ mode: "demo-safe", ...summary, checks: readinessChecks }, { status: summary.productionReady ? 200 : 503 });
}
