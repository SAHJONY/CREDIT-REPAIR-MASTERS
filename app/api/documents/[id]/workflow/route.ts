import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateBusinessUser, authorizeRoles } from '@/lib/api-auth';
import { getPlatformStore } from '@/lib/platform-store';
import { documentMetadata } from '@/lib/document-sharing';
import { signatureMatchesCurrentVersion, signatureRecord } from '@/lib/document-workflow';

const bodySchema = z.object({
  clientId: z.string().trim().min(3).max(160),
  action: z.enum(['request_signature', 'mark_sent', 'response_received'])
});

function consentActive(consent: { granted: boolean; revokedAt?: string; expiresAt?: string }) {
  if (!consent.granted || consent.revokedAt) return false;
  return !consent.expiresAt || Date.parse(consent.expiresAt) > Date.now();
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = authorizeRoles(await authenticateBusinessUser(request), ['owner','admin','credit_specialist','compliance_reviewer']);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'INVALID_DOCUMENT_WORKFLOW_REQUEST' }, { status: 400 });

  const { id } = await params;
  const store = getPlatformStore();
  const client = await store.getClient(auth.organizationId, parsed.data.clientId);
  if (!client) return NextResponse.json({ error: 'CLIENT_NOT_FOUND' }, { status: 404 });
  const [evidence, audit, consents] = await Promise.all([
    store.listEvidence(auth.organizationId, client.id),
    store.listAudit(auth.organizationId, 500),
    store.listConsents(auth.organizationId, client.id)
  ]);
  const document = evidence.find((item) => item.id === id);
  if (!document) return NextResponse.json({ error: 'DOCUMENT_NOT_FOUND' }, { status: 404 });
  const metadata = documentMetadata(audit, document);
  if (metadata.documentClass !== 'client_document') return NextResponse.json({ error: 'CLIENT_DOCUMENT_REQUIRED' }, { status: 409 });

  const now = new Date().toISOString();
  if (parsed.data.action === 'request_signature') {
    if (!document.sha256) return NextResponse.json({ error: 'DOCUMENT_VERSION_NOT_LOCKED' }, { status: 409 });
    await store.appendAudit(auth.organizationId, {
      id: `audit_${randomUUID()}`,
      organizationId: auth.organizationId,
      actorType: 'user',
      actorId: auth.actorId,
      action: 'document.shared',
      resourceType: 'evidence',
      resourceId: id,
      decision: 'allowed',
      metadata: { clientId: client.id, purpose: 'signature_review' },
      createdAt: now
    });
    await store.appendAudit(auth.organizationId, {
      id: `audit_${randomUUID()}`,
      organizationId: auth.organizationId,
      actorType: 'user',
      actorId: auth.actorId,
      action: 'document.signature_requested',
      resourceType: 'evidence',
      resourceId: id,
      decision: 'approval_required',
      metadata: { clientId: client.id, documentSha256: document.sha256 },
      createdAt: now
    });
    return NextResponse.json({ id, state: 'signature_required' });
  }

  if (parsed.data.action === 'mark_sent') {
    if (!signatureRecord(audit, id) || !signatureMatchesCurrentVersion(audit, document)) {
      return NextResponse.json({ error: 'CURRENT_VERSION_NOT_SIGNED' }, { status: 409 });
    }
    if (metadata.category === 'dispute') {
      const submissionConsent = consents.some((consent) => consent.scope === 'dispute_submission' && consentActive(consent));
      if (!submissionConsent) return NextResponse.json({ error: 'DISPUTE_SUBMISSION_CONSENT_REQUIRED' }, { status: 409 });
    }
    await store.appendAudit(auth.organizationId, {
      id: `audit_${randomUUID()}`,
      organizationId: auth.organizationId,
      actorType: 'user',
      actorId: auth.actorId,
      action: 'document.sent',
      resourceType: 'evidence',
      resourceId: id,
      decision: 'allowed',
      metadata: { clientId: client.id, documentSha256: document.sha256 || '' },
      createdAt: now
    });
    return NextResponse.json({ id, state: 'sent', sentAt: now });
  }

  await store.appendAudit(auth.organizationId, {
    id: `audit_${randomUUID()}`,
    organizationId: auth.organizationId,
    actorType: 'user',
    actorId: auth.actorId,
    action: 'document.response_received',
    resourceType: 'evidence',
    resourceId: id,
    decision: 'allowed',
    metadata: { clientId: client.id },
    createdAt: now
  });
  return NextResponse.json({ id, state: 'response_received', recordedAt: now });
}
