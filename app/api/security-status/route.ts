import { NextResponse } from "next/server";
import { neonAuthConfigured } from "@/lib/auth/server";

export async function GET() {
  const production = process.env.VERCEL_ENV === "production" || process.env.APP_ENV === "production";
  const sessionAuthConfigured = neonAuthConfigured();
  const breakGlassTokenConfigured = Boolean(process.env.CREDIT_OS_API_TOKEN?.trim());
  const mfaEnforced = process.env.AUTH_MFA_ENFORCED === "true";

  return NextResponse.json({
    version: "1.6.0",
    production,
    sessionAuthConfigured,
    membershipGateConfigured: sessionAuthConfigured && Boolean(process.env.DATABASE_URL?.trim()),
    mfaEnforced,
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
