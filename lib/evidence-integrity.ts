import { createHash } from "node:crypto";
import type { CreditCase, EvidenceItem } from "./case-types";

export interface CaseEvidenceAssessment {
  caseId: string;
  linked: number;
  verified: number;
  unverified: number;
  integrityRecorded: number;
  verifiedCoverage: number;
  draftEvidenceReady: boolean;
  fingerprints: Array<{ evidenceId: string; metadataSha256: string; documentChecksumRecorded: boolean }>;
}

export function fingerprintEvidenceMetadata(item: EvidenceItem): string {
  const canonical = JSON.stringify({
    id: item.id,
    caseId: item.caseId,
    kind: item.kind,
    label: item.label,
    source: item.source,
    capturedAt: item.capturedAt,
    verified: item.verified
  });
  return createHash("sha256").update(canonical).digest("hex");
}

export function assessCaseEvidence(creditCase: CreditCase, evidence: EvidenceItem[]): CaseEvidenceAssessment {
  const linked = evidence.filter((item) => creditCase.evidenceIds.includes(item.id) || item.caseId === creditCase.id);
  const verified = linked.filter((item) => item.verified).length;
  const integrityRecorded = linked.filter((item) => Boolean(item.checksum)).length;
  const verifiedCoverage = linked.length === 0 ? 0 : Math.round((verified / linked.length) * 100);
  return {
    caseId: creditCase.id,
    linked: linked.length,
    verified,
    unverified: linked.length - verified,
    integrityRecorded,
    verifiedCoverage,
    draftEvidenceReady: verified > 0,
    fingerprints: linked.map((item) => ({
      evidenceId: item.id,
      metadataSha256: fingerprintEvidenceMetadata(item),
      documentChecksumRecorded: Boolean(item.checksum)
    }))
  };
}

export function buildEvidenceMatrix(cases: CreditCase[], evidence: EvidenceItem[]) {
  return cases.map((creditCase) => assessCaseEvidence(creditCase, evidence));
}
