import { NextRequest, NextResponse } from "next/server";
import { policyDecision } from "@/lib/orchestrator";
import type { ProposedAction } from "@/lib/compliance";
import { authenticateOperator } from "@/lib/api-auth";
import { completeOperation, failOperation, startOperation } from "@/lib/telemetry";

export async function POST(request: NextRequest) {
  const op = startOperation(request, "/api/policy", "policy.evaluate");
  const auth = authenticateOperator(request);
  if (!auth.ok) {
    failOperation(op, auth.error);
    return NextResponse.json({ error: auth.error, requestId: op.requestId }, { status: auth.status });
  }
  const body = await request.json() as { profileId?: string; caseId?: string; action?: ProposedAction };
  if (!body.profileId || !body.action?.kind) {
    failOperation(op, "POLICY_INPUT_INVALID");
    return NextResponse.json({ error: "profileId and action are required", requestId: op.requestId }, { status: 400 });
  }
  const event = policyDecision(body.profileId, body.action, auth.actorId, body.caseId);
  completeOperation(op, { authMode: auth.mode, action: body.action.kind, decision: event.decision });
  return NextResponse.json({ requestId: op.requestId, event }, { status: event.decision === "blocked" ? 403 : 200 });
}
