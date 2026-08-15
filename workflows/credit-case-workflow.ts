import { defineHook } from "workflow";
import { z } from "zod";
import { routeAgentTask, type AgentIntent, type RoutingContext } from "@/lib/agent-router";
import { secureModelInput } from "@/lib/security-guard";

export interface CreditCaseWorkflowInput {
  clientId: string;
  caseId: string;
  intent: AgentIntent;
  evidenceIds?: string[];
  consentId?: string;
  assertion?: string;
  amount?: number;
  narrative?: string;
}

export const creditApprovalHook = defineHook({
  schema: z.object({
    approved: z.boolean(),
    reviewerId: z.string().min(1),
    note: z.string().max(1000).optional()
  })
});

async function runSecurityStep(input: CreditCaseWorkflowInput) {
  "use step";
  const text = [input.assertion, input.narrative].filter(Boolean).join("\n");
  return secureModelInput(text);
}

async function runRoutingStep(input: CreditCaseWorkflowInput) {
  "use step";
  const context: RoutingContext = {
    intent: input.intent,
    evidenceIds: input.evidenceIds,
    consentId: input.consentId,
    assertion: input.assertion,
    amount: input.amount
  };
  return routeAgentTask(context);
}

export async function creditCaseWorkflow(input: CreditCaseWorkflowInput) {
  "use workflow";

  const security = await runSecurityStep(input);
  if (!security.allowed) {
    return { status: "blocked_security", caseId: input.caseId, findings: security.findings, externalExecutionEnabled: false };
  }

  const route = await runRoutingStep(input);
  if (route.execution === "blocked") {
    return { status: "blocked_policy", caseId: input.caseId, reason: route.policy.reason, externalExecutionEnabled: false };
  }

  if (route.execution === "approval_required") {
    const approval = creditApprovalHook.create({ token: `credit-approval:${input.caseId}:${input.intent}` });
    const decision = await approval;
    if (!decision.approved) {
      return { status: "rejected_by_reviewer", caseId: input.caseId, reviewerId: decision.reviewerId, externalExecutionEnabled: false };
    }
    return {
      status: "approved_for_manual_execution",
      caseId: input.caseId,
      reviewerId: decision.reviewerId,
      note: decision.note,
      externalExecutionEnabled: false
    };
  }

  return {
    status: "analysis_ready",
    caseId: input.caseId,
    primaryAgent: route.primary.id,
    supportAgents: route.support.map((agent) => agent?.id).filter(Boolean),
    externalExecutionEnabled: false
  };
}
