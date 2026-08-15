import { NextResponse } from "next/server";
import { z } from "zod";
import { creditApprovalHook } from "@/workflows/credit-case-workflow";
import { authenticateOperator } from "@/lib/api-auth";

const approvalSchema = z.object({
  caseId: z.string().min(1),
  intent: z.enum(["analyze_report", "draft_dispute", "submit_dispute", "plan_paydown", "execute_payment", "business_credit_plan", "identity_theft_case", "monitor_changes"]),
  approved: z.boolean(),
  note: z.string().max(1000).optional()
});

export async function POST(request: Request) {
  const auth = authenticateOperator(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const parsed = approvalSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "INVALID_APPROVAL", issues: parsed.error.issues }, { status: 400 });
  const { caseId, intent, approved, note } = parsed.data;
  const result = await creditApprovalHook.resume(`credit-approval:${caseId}:${intent}`, { approved, reviewerId: auth.actorId, note });
  if (!result) return NextResponse.json({ error: "APPROVAL_HOOK_NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ resumed: true, runId: result.runId, reviewerId: auth.actorId, externalExecutionEnabled: false });
}
