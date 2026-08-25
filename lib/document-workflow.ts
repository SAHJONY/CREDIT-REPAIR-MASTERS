import type { AuditRecord, EvidenceRecord } from './platform-types';
import { documentMetadata } from './document-sharing';

export type DocumentWorkflowState = 'internal' | 'signature_required' | 'signed' | 'sent' | 'response_received';

function latestAction(audit: AuditRecord[], evidenceId: string, actions: string[]) {
  return audit
    .filter((record) => record.resourceType === 'evidence' && record.resourceId === evidenceId && actions.includes(record.action))
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0];
}

export function signatureRequest(audit: AuditRecord[], evidenceId: string) {
  return latestAction(audit, evidenceId, ['document.signature_requested']);
}

export function signatureRecord(audit: AuditRecord[], evidenceId: string) {
  return latestAction(audit, evidenceId, ['document.signed']);
}

export function sentRecord(audit: AuditRecord[], evidenceId: string) {
  return latestAction(audit, evidenceId, ['document.sent']);
}

export function responseRecord(audit: AuditRecord[], evidenceId: string) {
  return latestAction(audit, evidenceId, ['document.response_received']);
}

export function documentWorkflowState(audit: AuditRecord[], evidenceId: string): DocumentWorkflowState {
  const candidates = [
    { state: 'signature_required' as const, record: signatureRequest(audit, evidenceId) },
    { state: 'signed' as const, record: signatureRecord(audit, evidenceId) },
    { state: 'sent' as const, record: sentRecord(audit, evidenceId) },
    { state: 'response_received' as const, record: responseRecord(audit, evidenceId) }
  ].filter((item): item is { state: Exclude<DocumentWorkflowState, 'internal'>; record: AuditRecord } => Boolean(item.record));
  if (!candidates.length) return 'internal';
  candidates.sort((a, b) => Date.parse(b.record.createdAt) - Date.parse(a.record.createdAt));
  return candidates[0].state;
}

export function signatureRequestMatchesCurrentVersion(audit: AuditRecord[], evidence: EvidenceRecord) {
  const request = signatureRequest(audit, evidence.id);
  if (!request) return false;
  const requestedHash = typeof request.metadata?.documentSha256 === 'string' ? request.metadata.documentSha256 : '';
  return Boolean(evidence.sha256 && requestedHash && evidence.sha256 === requestedHash);
}

export function signatureMatchesCurrentVersion(audit: AuditRecord[], evidence: EvidenceRecord) {
  const signed = signatureRecord(audit, evidence.id);
  if (!signed) return false;
  const signedHash = typeof signed.metadata?.documentSha256 === 'string' ? signed.metadata.documentSha256 : '';
  return Boolean(evidence.sha256 && signedHash && evidence.sha256 === signedHash);
}

export function isClientLetter(audit: AuditRecord[], evidence: EvidenceRecord) {
  const metadata = documentMetadata(audit, evidence);
  return metadata.documentClass === 'client_document' && metadata.category === 'dispute';
}

export function clientDocumentStatusLabel(audit: AuditRecord[], evidence: EvidenceRecord) {
  const state = documentWorkflowState(audit, evidence.id);
  if (state === 'signature_required') return signatureRequestMatchesCurrentVersion(audit, evidence) ? 'Signature required' : 'Changed · new signature request required';
  if (state === 'signed') return signatureMatchesCurrentVersion(audit, evidence) ? 'Signed · ready for sending' : 'Changed · re-sign required';
  if (state === 'sent') return 'Sent by New850';
  if (state === 'response_received') return 'Response received';
  return 'Internal';
}
