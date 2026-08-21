import { NextResponse } from "next/server";
import { configuredOrganizationId } from "@/lib/api-auth";
import { neonAuthConfigured } from "@/lib/auth/server";
import { productionMfaReady } from "@/lib/mfa";

export async function GET() {
  const production = process.env.VERCEL_ENV === "production" || process.env.APP_ENV === "production";
  const sessionAuthConfigured = neonAuthConfigured();
  const membershipGateConfigured = sessionAuthConfigured && Boolean(process.env.DATABASE_URL?.trim());
  const breakGlassTokenConfigured = Boolean(process.env.CREDIT_OS_API_TOKEN?.trim());
  const mfaPolicyEnforced = membershipGateConfigured;
  const mfaEnrollmentReady = membershipGateConfigured
    ? await productionMfaReady(configuredOrganizationId())
    : false;

  return NextResponse.json({
    version: "1.7.0",
    production,
    sessionAuthConfigured,
    membershipGateConfigured,
    mfaEnforced: mfaPolicyEnforced,
    mfaEnrollmentReady,
    breakGlassTokenConfigured,
    sensitiveRoutesFailClosed: production,
    protectedRoutes: [
      "POST /api/bootstrap",
      "GET|POST /api/clients",
      "POST /api/chatgpt-brain",
      "POST /api/agent-router",
      "POST /api/security-guard",
      "POST /api/policy",
      "POST /api/workflows/credit-case",
      "POST /api/workflows/credit-case/approval"
    ],
    telemetry: { structured: true, piiPayloadLogging: false, requestCorrelation: true }
  });
}
