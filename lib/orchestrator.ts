import { analyzeProfile, paydownPlan, utilization } from "./credit-engine";
import { evaluateAction, type PolicyEvaluation, type ProposedAction } from "./compliance";
import { casesFromFindings, type AuditEvent, type CreditCase, type EvidenceItem } from "./case-types";
import type { CreditProfile } from "./types";

export interface BrainSnapshot {
  profile: CreditProfile;
  metrics: {
    utilization: number;
    averageScore: number | null;
    openCases: number;
    evidenceCoverage: number;
  };
  findings: ReturnType<typeof analyzeProfile>;
  cases: CreditCase[];
  evidence: EvidenceItem[];
  paydownPlan: ReturnType<typeof paydownPlan>;
  attention: Array<{ priority: "P0" | "P1" | "P2"; title: string; reason: string }>;
  audit: AuditEvent[];
}

function averageScore(profile: CreditProfile) {
  const values = profile.scores.map((x) => x.score).filter((x): x is number => typeof x === "number");
  if (!values.length) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export function buildBrainSnapshot(profile: CreditProfile, evidence: EvidenceItem[] = []): BrainSnapshot {
  const findings = analyzeProfile(profile);
  const cases = casesFromFindings(profile.id, findings);
  const verifiedEvidence = evidence.filter((item) => item.verified);
  const verifiedEvidenceByCase = new Map<string, number>();
  verifiedEvidence.forEach((item) => verifiedEvidenceByCase.set(item.caseId, (verifiedEvidenceByCase.get(item.caseId) ?? 0) + 1));

  const hydratedCases = cases.map((item) => ({
    ...item,
    evidenceIds: verifiedEvidence.filter((ev) => ev.caseId === item.id).map((ev) => ev.id),
    status: verifiedEvidenceByCase.get(item.id) ? (item.status === "evidence_required" ? "ready_to_draft" : item.status) : item.status
  })) as CreditCase[];

  const evidenceCases = hydratedCases.filter((item) => item.evidenceIds.length > 0).length;
  const attention = findings.map((finding) => ({
    priority: finding.severity === "high" ? "P0" as const : finding.requiresApproval ? "P1" as const : "P2" as const,
    title: finding.title,
    reason: finding.action
  }));

  return {
    profile,
    metrics: {
      utilization: utilization(profile),
      averageScore: averageScore(profile),
      openCases: hydratedCases.filter((item) => item.status !== "resolved").length,
      evidenceCoverage: hydratedCases.length ? Math.round((evidenceCases / hydratedCases.length) * 100) : 100
    },
    findings,
    cases: hydratedCases,
    evidence,
    paydownPlan: paydownPlan(profile),
    attention,
    audit: []
  };
}

export function policyDecision(
  profileId: string,
  action: ProposedAction,
  actor = "AI Credit CEO",
  caseId?: string,
  resolvedEvaluation?: PolicyEvaluation
): AuditEvent {
  const result = resolvedEvaluation ?? evaluateAction(action);
  return {
    id: `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    profileId,
    caseId,
    actor,
    event: action.kind,
    decision: !result.allowed ? "blocked" : result.approval ? "approval_required" : "allowed",
    reason: result.reason,
    at: new Date().toISOString()
  };
}
