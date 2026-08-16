import { NextResponse } from "next/server";
import { configuredOrganizationId } from "@/lib/api-auth";
import { productionMfaReady } from "@/lib/mfa";
import { getReadinessChecks, readinessSummary } from "@/lib/readiness";

export async function GET() {
  const checks = getReadinessChecks();
  const mfaReady = await productionMfaReady(configuredOrganizationId());
  const resolved = checks.map((check) => check.id === 'mfa'
    ? {
        ...check,
        status: mfaReady ? 'ready' as const : 'setup' as const,
        detail: mfaReady ? 'All active privileged operators have verified MFA enrollment' : 'Privileged MFA key and verified owner/admin enrollment required'
      }
    : check);
  const summary = readinessSummary(resolved);
  const mode = summary.productionReady ? "production-ready" : "controlled-live";
  return NextResponse.json({ mode, ...summary, checks: resolved }, { status: summary.productionReady ? 200 : 503 });
}
