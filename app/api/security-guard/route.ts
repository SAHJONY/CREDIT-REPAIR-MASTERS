import { NextResponse } from "next/server";
import { secureModelInput } from "@/lib/security-guard";
import { authenticateOperator } from "@/lib/api-auth";
import { completeOperation, failOperation, startOperation } from "@/lib/telemetry";

export async function POST(request: Request) {
  const op = startOperation(request, "/api/security-guard", "security_guard.inspect");
  const auth = authenticateOperator(request);
  if (!auth.ok) {
    failOperation(op, auth.error);
    return NextResponse.json({ error: auth.error, requestId: op.requestId }, { status: auth.status });
  }
  const body = (await request.json()) as { text?: string };
  if (typeof body.text !== "string") {
    failOperation(op, "TEXT_REQUIRED");
    return NextResponse.json({ error: "text is required", requestId: op.requestId }, { status: 400 });
  }
  const result = secureModelInput(body.text);
  completeOperation(op, { authMode: auth.mode, allowed: result.allowed, findings: result.findings.length });
  return NextResponse.json({ requestId: op.requestId, ...result });
}
