import { evaluateAction, type ProposedAction, type PolicyEvaluation } from "./compliance";
import { getAgent } from "./agent-registry";
import { resolveStateCompliance } from "./state-compliance";

export type AgentIntent =
  | "analyze_report"
  | "draft_dispute"
  | "submit_dispute"
  | "plan_paydown"
  | "execute_payment"
  | "business_credit_plan"
  | "identity_theft_case"
  | "monitor_changes";

export interface RoutingContext {
  intent: AgentIntent;
  evidenceIds?: string[];
  consentId?: string;
  assertion?: string;
  amount?: number;
  state?: string;
}

const routingMap: Record<AgentIntent, { primary: string; support: string[] }> = {
  analyze_report: { primary: "report-parser", support: ["strategy", "compliance"] },
  draft_dispute: { primary: "dispute", support: ["evidence", "furnisher", "compliance"] },
  submit_dispute: { primary: "compliance", support: ["dispute", "evidence"] },
  plan_paydown: { primary: "utilization", support: ["debt", "strategy"] },
  execute_payment: { primary: "compliance", support: ["debt"] },
  business_credit_plan: { primary: "business-credit", support: ["strategy", "compliance"] },
  identity_theft_case: { primary: "identity", support: ["evidence", "compliance"] },
  monitor_changes: { primary: "monitoring", support: ["strategy"] }
};

function toProposedAction(context: RoutingContext): ProposedAction {
  switch (context.intent) {
    case "draft_dispute": return { kind: "draft_dispute", evidence: context.evidenceIds, assertion: context.assertion };
    case "submit_dispute": return { kind: "submit_dispute", evidence: context.evidenceIds, consentId: context.consentId, assertion: context.assertion };
    case "execute_payment": return { kind: "make_payment", consentId: context.consentId, amount: context.amount };
    case "identity_theft_case": return { kind: "identity_theft_claim", evidence: context.evidenceIds, consentId: context.consentId };
    default: return { kind: "analyze", evidence: context.evidenceIds };
  }
}

function jurisdictionPolicy(context: RoutingContext, base: PolicyEvaluation): PolicyEvaluation {
  if (!base.allowed) return base;
  if (!(["submit_dispute", "identity_theft_case", "execute_payment"] as AgentIntent[]).includes(context.intent)) return base;

  const stateRule = resolveStateCompliance(context.state);
  if (stateRule.mode === "blocked") {
    return { allowed: false, approval: false, reason: `Jurisdiction blocked: ${stateRule.jurisdiction} is unknown or unsupported.` };
  }
  if (stateRule.mode === "manual_review_required") {
    return { allowed: true, approval: true, reason: `Manual compliance review required for ${stateRule.name}; state-specific overlay is not yet validated.` };
  }
  return base;
}

export function routeAgentTask(context: RoutingContext) {
  const route = routingMap[context.intent];
  const primary = getAgent(route.primary);
  if (!primary) throw new Error(`AGENT_NOT_FOUND:${route.primary}`);
  const policy = jurisdictionPolicy(context, evaluateAction(toProposedAction(context)));
  return {
    intent: context.intent,
    primary,
    support: route.support.map((id) => getAgent(id)).filter(Boolean),
    policy,
    jurisdiction: resolveStateCompliance(context.state),
    execution: !policy.allowed ? "blocked" : policy.approval ? "approval_required" : "autonomous",
    canExecuteExternally: false
  } as const;
}
