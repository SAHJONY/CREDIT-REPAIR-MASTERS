import type { EvidenceItem } from "./case-types";

export type DisputeIssueType =
  | "accurate_negative"
  | "wrong_balance"
  | "wrong_payment_history"
  | "duplicate_account"
  | "identity_mismatch"
  | "not_mine"
  | "incorrect_dates"
  | "incomplete_reporting"
  | "other_inaccuracy";

export interface DisputeClaim {
  issueType: DisputeIssueType;
  assertion: string;
  evidenceIds: string[];
}

export interface DisputeClaimAssessment {
  draftEligible: boolean;
  reason: string;
  verifiedEvidenceCount: number;
  linkedEvidenceCount: number;
  evidenceStrength: number;
  submissionRequiresApproval: true;
  externalExecutionEnabled: false;
}

const identityIssues = new Set<DisputeIssueType>(["identity_mismatch", "not_mine"]);

export function evaluateDisputeClaim(claim: DisputeClaim, evidence: EvidenceItem[]): DisputeClaimAssessment {
  if (claim.issueType === "accurate_negative") {
    return {
      draftEligible: false,
      reason: "Accurate negative information is not eligible for an inaccuracy-based dispute merely because it is negative.",
      verifiedEvidenceCount: 0,
      linkedEvidenceCount: 0,
      evidenceStrength: 0,
      submissionRequiresApproval: true,
      externalExecutionEnabled: false
    };
  }

  const linked = evidence.filter((item) => claim.evidenceIds.includes(item.id));
  const verified = linked.filter((item) => item.verified);
  if (linked.length === 0 || verified.length === 0) {
    return {
      draftEligible: false,
      reason: "No verified evidence is linked to the factual assertion.",
      verifiedEvidenceCount: verified.length,
      linkedEvidenceCount: linked.length,
      evidenceStrength: 0,
      submissionRequiresApproval: true,
      externalExecutionEnabled: false
    };
  }

  if (identityIssues.has(claim.issueType) && !verified.some((item) => item.kind === "identity")) {
    return {
      draftEligible: false,
      reason: "Identity-related assertions require verified identity evidence before drafting can proceed.",
      verifiedEvidenceCount: verified.length,
      linkedEvidenceCount: linked.length,
      evidenceStrength: Math.min(0.7, verified.length / linked.length),
      submissionRequiresApproval: true,
      externalExecutionEnabled: false
    };
  }

  const evidenceStrength = Math.min(0.9, Math.round(((verified.length / linked.length) * 0.7 + Math.min(verified.length, 2) * 0.1) * 100) / 100);
  return {
    draftEligible: true,
    reason: "Verified evidence supports preparation of a reviewable draft; submission remains separately approval-gated.",
    verifiedEvidenceCount: verified.length,
    linkedEvidenceCount: linked.length,
    evidenceStrength,
    submissionRequiresApproval: true,
    externalExecutionEnabled: false
  };
}
