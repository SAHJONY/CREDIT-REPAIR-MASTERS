import { NextResponse } from "next/server";
import { z } from "zod";
import { creditApprovalHook } from "@/workflows/credit-case-workflow";
import { authenticateOperator } from "@/lib/api-auth";
import { completeOperation, failOperation, startOperation } from "@/lib/telemetry";

const approvalSchema = z.object({
  caseId: z.string().min(1),
  intent: z.enum(["analyze_report", "draft_dispute", "submit_dispute", "plan_paydown", "execute_payment", "business_credit_plan", "identity_theft_case", "monitor_changes"]),
  approved: z.boolean(),
  note: z.string().max(1000).optional()
});

export async function POST(request: Request) {
  const op = startOperation(request, "/api/workflows/credit-case/approval", "workflow.approval");
  const auth = authenticateOperator(request);
  if (!auth.ok) {
    failOperation(op, auth.error);
    return NextResponse.json({ error: auth.error, requestId: op.requestId }, { status: auth.status });
  }
  const parsed = approvalSchema.safeParse(await request.json());
  if (!parsed.success) {
    failOperation(op, "INVALID_APPROVAL");
    return NextResponse.json({ error: "INVALID_APPROVAL", issues: parsed.error.issues, requestId: op.requestId }, { status: 400 });
  }
  const { caseId, intent, approved, note } = parsed.data;
  try {
    const result = await creditApprovalHook.resume(`credit-approval:${caseId}:${intent}`, { approved, reviewerId: auth.actorId, note });
    if (!result) {
      failOperation(op, "APPROVAL_HOOK_NOT_FOUND");
      return NextResponse.json({ error: "APPROVAL_HOOK_NOT_FOUND", requestId: op.requestId }, { status: 404 });
    }
    completeOperation(op, { authMode: auth.mode, intent, approved });
    return NextResponse.json({ resumed: true, runId: result.runId, reviewerId: auth.actorId, requestId: op.requestId, externalExecutionEnabled: false });
  } catch (error) {
    failOperation(op, "APPROVAL_RESUME_FAILED", error);
    return NextResponse.json({ error: "APPROVAL_RESUME_FAILED", requestId: op.requestId }, { status: 500 });
  }
}
