import { NextResponse } from "next/server";
import { z } from "zod";
import { creditApprovalHook } from "@/workflows/credit-case-workflow";

const approvalSchema = z.object({
  caseId: z.string().min(1),
  intent: z.enum(["analyze_report", "draft_dispute", "submit_dispute", "plan_paydown", "execute_payment", "business_credit_plan", "identity_theft_case", "monitor_changes"]),
  approved: z.boolean(),
  reviewerId: z.string().min(1),
  note: z.string().max(1000).optional()
});

export async function POST(request: Request) {
  const parsed = approvalSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "INVALID_APPROVAL", issues: parsed.error.issues }, { status: 400 });
  const { caseId, intent, approved, reviewerId, note } = parsed.data;
  const result = await creditApprovalHook.resume(`credit-approval:${caseId}:${intent}`, { approved, reviewerId, note });
  if (!result) return NextResponse.json({ error: "APPROVAL_HOOK_NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ resumed: true, runId: result.runId, externalExecutionEnabled: false });
}
