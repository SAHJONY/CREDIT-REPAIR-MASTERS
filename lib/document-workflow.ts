import type { AuditRecord, EvidenceRecord } from './platform-types';
import { documentMetadata } from './document-sharing';

export type DocumentWorkflowState = 'internal' | 'signature_required' | 'signed' | 'sent' | 'response_received';

function latestAction(audit: AuditRecord[], evidenceId: string, actions: string[]) {
  return audit.find((record) => record.resourceType === 'evidence' && record.resourceId === evidenceId && actions.includes(record.action));
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
  if (responseRecord(audit, evidenceId)) return 'response_received';
  if (sentRecord(audit, evidenceId)) return 'sent';
  if (signatureRecord(audit, evidenceId)) return 'signed';
  if (signatureRequest(audit, evidenceId)) return 'signature_required';
  return 'internal';
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
  if (state === 'signature_required') return 'Signature required';
  if (state === 'signed') return signatureMatchesCurrentVersion(audit, evidence) ? 'Signed · ready for sending' : 'Changed · re-sign required';
  if (state === 'sent') return 'Sent by New850';
  if (state === 'response_received') return 'Response received';
  return 'Internal';
}
