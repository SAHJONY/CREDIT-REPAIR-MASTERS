import type { AuditRecord, EvidenceRecord } from './platform-types';

export type DocumentClass = 'sample' | 'template' | 'client_document';
export type DocumentCategory = 'agreement' | 'credit_report' | 'dispute' | 'compliance' | 'billing' | 'business_credit' | 'identity' | 'evidence' | 'other';

export type DocumentMetadata = {
  category: DocumentCategory;
  documentClass: DocumentClass;
  filename?: string;
  contentType?: string;
};

export function latestDocumentAction(audit: AuditRecord[], evidenceId: string) {
  return audit.find((record) => record.resourceType === 'evidence' && record.resourceId === evidenceId && (record.action === 'document.shared' || record.action === 'document.unshared'));
}

export function isDocumentShared(audit: AuditRecord[], evidenceId: string): boolean {
  return latestDocumentAction(audit, evidenceId)?.action === 'document.shared';
}

export function documentMetadata(audit: AuditRecord[], evidence: EvidenceRecord): DocumentMetadata {
  const uploaded = audit.find((record) => record.resourceType === 'evidence' && record.resourceId === evidence.id && record.action === 'document.uploaded');
  const metadata = uploaded?.metadata ?? {};
  return {
    category: (typeof metadata.category === 'string' ? metadata.category : 'other') as DocumentCategory,
    documentClass: (typeof metadata.documentClass === 'string' ? metadata.documentClass : 'client_document') as DocumentClass,
    filename: typeof metadata.filename === 'string' ? metadata.filename : undefined,
    contentType: typeof metadata.contentType === 'string' ? metadata.contentType : undefined
  };
}

export function isManagedDocument(audit: AuditRecord[], evidenceId: string): boolean {
  return audit.some((record) => record.resourceType === 'evidence' && record.resourceId === evidenceId && record.action === 'document.uploaded');
}
