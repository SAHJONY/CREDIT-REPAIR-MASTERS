import { NextResponse } from "next/server";
import { start } from "workflow/api";
import { z } from "zod";
import { creditCaseWorkflow } from "@/workflows/credit-case-workflow";
import { authenticateOperator } from "@/lib/api-auth";
import { completeOperation, failOperation, startOperation } from "@/lib/telemetry";

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
  const op = startOperation(request, "/api/workflows/credit-case", "workflow.start");
  const auth = authenticateOperator(request);
  if (!auth.ok) {
    failOperation(op, auth.error);
    return NextResponse.json({ error: auth.error, requestId: op.requestId }, { status: auth.status });
  }
  const parsed = inputSchema.safeParse(await request.json());
  if (!parsed.success) {
    failOperation(op, "INVALID_WORKFLOW_INPUT");
    return NextResponse.json({ error: "INVALID_WORKFLOW_INPUT", issues: parsed.error.issues, requestId: op.requestId }, { status: 400 });
  }
  try {
    const run = await start(creditCaseWorkflow, [parsed.data]);
    completeOperation(op, { authMode: auth.mode, intent: parsed.data.intent, status: "queued" });
    return NextResponse.json({ runId: run.runId, status: "queued", requestedBy: auth.actorId, requestId: op.requestId, externalExecutionEnabled: false }, { status: 202 });
  } catch (error) {
    failOperation(op, "WORKFLOW_START_FAILED", error);
    return NextResponse.json({ error: "WORKFLOW_START_FAILED", requestId: op.requestId }, { status: 500 });
  }
}
