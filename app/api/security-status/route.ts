import { NextResponse } from "next/server";

export async function GET() {
  const production = process.env.VERCEL_ENV === "production" || process.env.APP_ENV === "production";
  return NextResponse.json({
    version: "1.1.0",
    production,
    operatorAuthConfigured: Boolean(process.env.CREDIT_OS_API_TOKEN),
    sensitiveRoutesFailClosed: production,
    protectedRoutes: [
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
