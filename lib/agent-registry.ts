export type AgentAuthority = "autonomous" | "approval_required" | "blocked";
export type AgentRisk = "low" | "medium" | "high" | "critical";

export interface AgentDefinition {
  id: string;
  name: string;
  mission: string;
  riskCeiling: AgentRisk;
  authority: AgentAuthority;
  tools: readonly string[];
  maxToolCalls: number;
  evidenceRequired: boolean;
}

export const agentRegistry: readonly AgentDefinition[] = [
  { id: "credit-ceo", name: "AI Credit CEO", mission: "Orchestrate the credit operating system and rank next-best-actions.", riskCeiling: "high", authority: "autonomous", tools: ["inspect_snapshot", "inspect_case", "evaluate_policy", "calculate_paydown"], maxToolCalls: 12, evidenceRequired: false },
  { id: "report-parser", name: "Report Parser Agent", mission: "Normalize bureau/report data into the Credit Digital Twin.", riskCeiling: "medium", authority: "autonomous", tools: ["inspect_snapshot"], maxToolCalls: 6, evidenceRequired: false },
  { id: "strategy", name: "Credit Strategy Agent", mission: "Prioritize lawful interventions by expected impact, evidence and controllability.", riskCeiling: "medium", authority: "autonomous", tools: ["inspect_snapshot", "inspect_case", "calculate_paydown"], maxToolCalls: 8, evidenceRequired: false },
  { id: "evidence", name: "Evidence Agent", mission: "Assess whether a proposed assertion is supported by linked evidence.", riskCeiling: "high", authority: "autonomous", tools: ["inspect_case", "evaluate_policy"], maxToolCalls: 8, evidenceRequired: true },
  { id: "dispute", name: "Dispute Agent", mission: "Prepare evidence-backed dispute drafts and case narratives.", riskCeiling: "high", authority: "approval_required", tools: ["inspect_case", "evaluate_policy"], maxToolCalls: 8, evidenceRequired: true },
  { id: "furnisher", name: "Furnisher Agent", mission: "Analyze furnisher-reported fields, inconsistencies and response state.", riskCeiling: "high", authority: "autonomous", tools: ["inspect_case", "evaluate_policy"], maxToolCalls: 8, evidenceRequired: true },
  { id: "utilization", name: "Utilization Agent", mission: "Model utilization and cash-efficient balance reduction scenarios.", riskCeiling: "medium", authority: "autonomous", tools: ["inspect_snapshot", "calculate_paydown"], maxToolCalls: 6, evidenceRequired: false },
  { id: "debt", name: "Debt Optimization Agent", mission: "Model payment sequencing while preserving liquidity and authorization boundaries.", riskCeiling: "high", authority: "approval_required", tools: ["inspect_snapshot", "calculate_paydown", "evaluate_policy"], maxToolCalls: 8, evidenceRequired: false },
  { id: "business-credit", name: "Business Credit Agent", mission: "Build business-credit readiness without commingling consumer-credit workflows.", riskCeiling: "medium", authority: "autonomous", tools: ["inspect_snapshot"], maxToolCalls: 6, evidenceRequired: false },
  { id: "identity", name: "Identity Integrity Agent", mission: "Detect identity-data inconsistencies and route suspected identity-theft cases to evidence-first review.", riskCeiling: "critical", authority: "approval_required", tools: ["inspect_case", "evaluate_policy"], maxToolCalls: 6, evidenceRequired: true },
  { id: "compliance", name: "Compliance Guardian", mission: "Independently classify proposed actions as allowed, approval-required or blocked.", riskCeiling: "critical", authority: "autonomous", tools: ["evaluate_policy"], maxToolCalls: 6, evidenceRequired: false },
  { id: "monitoring", name: "Monitoring Agent", mission: "Detect meaningful changes and create reviewable events without executing external actions.", riskCeiling: "medium", authority: "autonomous", tools: ["inspect_snapshot", "inspect_case"], maxToolCalls: 6, evidenceRequired: false }
] as const;

export function getAgent(id: string): AgentDefinition | undefined {
  return agentRegistry.find((agent) => agent.id === id);
}

export function agentRegistrySummary() {
  return {
    total: agentRegistry.length,
    autonomous: agentRegistry.filter((agent) => agent.authority === "autonomous").length,
    approvalRequired: agentRegistry.filter((agent) => agent.authority === "approval_required").length,
    blocked: agentRegistry.filter((agent) => agent.authority === "blocked").length,
    maxCriticalRiskAgents: agentRegistry.filter((agent) => agent.riskCeiling === "critical").length
  };
}
