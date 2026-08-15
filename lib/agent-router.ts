import { evaluateAction, type ProposedAction } from "./compliance";
import { getAgent } from "./agent-registry";

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

export function routeAgentTask(context: RoutingContext) {
  const route = routingMap[context.intent];
  const primary = getAgent(route.primary);
  if (!primary) throw new Error(`AGENT_NOT_FOUND:${route.primary}`);
  const policy = evaluateAction(toProposedAction(context));
  return {
    intent: context.intent,
    primary,
    support: route.support.map((id) => getAgent(id)).filter(Boolean),
    policy,
    execution: !policy.allowed ? "blocked" : policy.approval ? "approval_required" : "autonomous",
    canExecuteExternally: false
  } as const;
}
