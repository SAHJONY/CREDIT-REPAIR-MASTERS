import { routeAgentTask, type RoutingContext } from "./agent-router";

export type WorkflowState = "intake" | "security_review" | "analysis" | "evidence_review" | "policy_review" | "approval_wait" | "ready" | "blocked" | "completed";

export interface WorkflowStep {
  id: string;
  state: WorkflowState;
  agentId: string;
  retryable: boolean;
  requiresHuman: boolean;
}

export function createWorkflowPlan(context: RoutingContext) {
  const route = routeAgentTask(context);
  const steps: WorkflowStep[] = [
    { id: "security", state: "security_review", agentId: "compliance", retryable: false, requiresHuman: false },
    { id: "analyze", state: "analysis", agentId: route.primary.id, retryable: true, requiresHuman: false }
  ];

  if (route.primary.evidenceRequired || context.evidenceIds?.length) steps.push({ id: "evidence", state: "evidence_review", agentId: "evidence", retryable: true, requiresHuman: false });
  steps.push({ id: "policy", state: "policy_review", agentId: "compliance", retryable: false, requiresHuman: false });

  if (!route.policy.allowed) steps.push({ id: "blocked", state: "blocked", agentId: "compliance", retryable: false, requiresHuman: false });
  else if (route.policy.approval) steps.push({ id: "approval", state: "approval_wait", agentId: "compliance", retryable: false, requiresHuman: true });
  else steps.push({ id: "ready", state: "ready", agentId: route.primary.id, retryable: false, requiresHuman: false });

  return {
    intent: context.intent,
    route,
    steps,
    terminalState: steps.at(-1)?.state ?? "blocked",
    durableRuntime: "spec-ready",
    externalExecutionEnabled: false
  };
}
