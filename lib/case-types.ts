import type { Finding, RiskLevel } from "./types";

export type CaseStatus =
  | "detected"
  | "evidence_required"
  | "ready_to_draft"
  | "drafted"
  | "approval_required"
  | "approved"
  | "submitted"
  | "waiting_response"
  | "resolved"
  | "blocked";

export type EvidenceKind = "credit_report" | "statement" | "payment_record" | "identity" | "correspondence" | "other";

export interface EvidenceItem {
  id: string;
  caseId: string;
  kind: EvidenceKind;
  label: string;
  source: string;
  capturedAt: string;
  checksum?: string;
  verified: boolean;
}

export interface ConsentRecord {
  id: string;
  profileId: string;
  scope: "dispute_submission" | "financial_action" | "new_credit" | "identity_theft_workflow";
  grantedAt: string;
  expiresAt?: string;
  revokedAt?: string;
}

export interface CreditCase {
  id: string;
  profileId: string;
  findingId: string;
  title: string;
  severity: RiskLevel;
  status: CaseStatus;
  evidenceIds: string[];
  consentId?: string;
  nextAction: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditEvent {
  id: string;
  profileId: string;
  caseId?: string;
  actor: string;
  event: string;
  decision: "allowed" | "approval_required" | "blocked" | "recorded";
  reason: string;
  at: string;
}

export function casesFromFindings(profileId: string, findings: Finding[], now = new Date().toISOString()): CreditCase[] {
  return findings.map((finding, index) => ({
    id: `CASE-${profileId}-${String(index + 1).padStart(3, "0")}`,
    profileId,
    findingId: finding.id,
    title: finding.title,
    severity: finding.severity,
    status: finding.id === "util-high" || finding.id === "util-medium" || finding.id === "thin-age" || finding.id === "inquiries"
      ? "detected"
      : "evidence_required",
    evidenceIds: [],
    nextAction: finding.action,
    createdAt: now,
    updatedAt: now
  }));
}
