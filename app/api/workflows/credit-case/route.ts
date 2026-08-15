import { NextResponse } from "next/server";
import { start } from "workflow/api";
import { z } from "zod";
import { creditCaseWorkflow } from "@/workflows/credit-case-workflow";
import { authenticateOperator } from "@/lib/api-auth";

const inputSchema = z.object({
  clientId: z.string().min(1),
  caseId: z.string().min(1),
  intent: z.enum(["analyze_report", "draft_dispute", "submit_dispute", "plan_paydown", "execute_payment", "business_credit_plan", "identity_theft_case", "monitor_changes"]),
  evidenceIds: z.array(z.string()).optional(),
  consentId: z.string().optional(),
  assertion: z.string().max(5000).optional(),
  amount: z.number().positive().optional(),
  narrative: z.string().max(10000).optional()
});

export async function POST(request: Request) {
  const auth = authenticateOperator(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const parsed = inputSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "INVALID_WORKFLOW_INPUT", issues: parsed.error.issues }, { status: 400 });
  const run = await start(creditCaseWorkflow, [parsed.data]);
  return NextResponse.json({ runId: run.runId, status: "queued", requestedBy: auth.actorId, externalExecutionEnabled: false }, { status: 202 });
}
