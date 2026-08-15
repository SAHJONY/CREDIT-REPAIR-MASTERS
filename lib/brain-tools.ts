import type { BrainSnapshot } from "./orchestrator";
import { evaluateAction, type ProposedAction } from "./compliance";

export type BrainToolName = "inspect_snapshot" | "inspect_case" | "calculate_paydown" | "evaluate_policy";

export interface BrainToolCall {
  name: BrainToolName;
  arguments: Record<string, unknown>;
}

export const brainTools = [
  {
    type: "function",
    name: "inspect_snapshot",
    description: "Read a minimized summary of the current credit profile, metrics, findings, and case statuses. Read-only.",
    strict: true,
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: { section: { type: "string", enum: ["metrics", "findings", "cases", "all"] } },
      required: ["section"]
    }
  },
  {
    type: "function",
    name: "inspect_case",
    description: "Read one case's severity, status, next action, and evidence metadata. Read-only.",
    strict: true,
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: { caseId: { type: "string" } },
      required: ["caseId"]
    }
  },
  {
    type: "function",
    name: "calculate_paydown",
    description: "Return the deterministic cash-efficient revolving paydown plan already calculated by the local credit engine. Read-only.",
    strict: true,
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {},
      required: []
    }
  },
  {
    type: "function",
    name: "evaluate_policy",
    description: "Ask the independent local policy engine whether a proposed action is allowed, approval-required, or blocked. This tool never executes the action.",
    strict: true,
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        kind: { type: "string", enum: ["analyze", "draft_dispute", "submit_dispute", "make_payment", "open_credit", "identity_theft_claim"] },
        caseId: { type: ["string", "null"] }
      },
      required: ["kind", "caseId"]
    }
  }
] as const;

function publicCase(snapshot: BrainSnapshot, caseId: string) {
  const item = snapshot.cases.find((c) => c.id === caseId);
  if (!item) return { error: "case_not_found" };
  const evidence = snapshot.evidence.filter((e) => e.caseId === caseId).map((e) => ({
    id: e.id,
    kind: e.kind,
    verified: e.verified,
    capturedAt: e.capturedAt
  }));
  return {
    id: item.id,
    title: item.title,
    severity: item.severity,
    status: item.status,
    nextAction: item.nextAction,
    evidence
  };
}

export function executeBrainTool(snapshot: BrainSnapshot, call: BrainToolCall): unknown {
  switch (call.name) {
    case "inspect_snapshot": {
      const section = call.arguments.section;
      const output = {
        metrics: snapshot.metrics,
        findings: snapshot.findings.map((f) => ({ id: f.id, title: f.title, severity: f.severity, confidence: f.confidence, action: f.action, requiresApproval: f.requiresApproval })),
        cases: snapshot.cases.map((c) => ({ id: c.id, title: c.title, severity: c.severity, status: c.status, evidenceCount: c.evidenceIds.length }))
      };
      if (section === "metrics") return { metrics: output.metrics };
      if (section === "findings") return { findings: output.findings };
      if (section === "cases") return { cases: output.cases };
      return output;
    }
    case "inspect_case":
      return publicCase(snapshot, String(call.arguments.caseId ?? ""));
    case "calculate_paydown":
      return { plan: snapshot.paydownPlan, cashAvailable: snapshot.profile.cashAvailable, utilization: snapshot.metrics.utilization };
    case "evaluate_policy": {
      const kind = String(call.arguments.kind ?? "") as ProposedAction["kind"];
      const caseId = typeof call.arguments.caseId === "string" ? call.arguments.caseId : undefined;
      const target = caseId ? snapshot.cases.find((c) => c.id === caseId) : undefined;
      const evidence = target?.evidenceIds ?? [];
      const action = { kind, evidence } as ProposedAction;
      const result = evaluateAction(action);
      return {
        caseId: caseId ?? null,
        kind,
        decision: !result.allowed ? "blocked" : result.approval ? "approval_required" : "allowed",
        reason: result.reason
      };
    }
    default:
      return { error: "unsupported_tool" };
  }
}
