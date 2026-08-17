import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateBusinessUser, authorizeRoles } from '@/lib/api-auth';
import { uploadPrivateEvidence } from '@/lib/evidence-vault';
import { getPlatformStore } from '@/lib/platform-store';

const schema = z.object({
  clientId: z.string().trim().min(3).max(160),
  label: z.string().trim().min(2).max(240),
  category: z.enum(['agreement','credit_report','dispute','compliance','billing','business_credit','identity','evidence','other']),
  shareNow: z.enum(['true','false']).default('false')
});

export async function POST(request: NextRequest) {
  const auth = authorizeRoles(await authenticateBusinessUser(request), ['owner','admin','credit_specialist','compliance_reviewer']);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  let uploaded: Awaited<ReturnType<typeof uploadPrivateEvidence>> | null = null;
  try {
    const form = await request.formData();
    const parsed = schema.safeParse({
      clientId: form.get('clientId'),
      label: form.get('label'),
      category: form.get('category'),
      shareNow: form.get('shareNow') || 'false'
    });
    if (!parsed.success) return NextResponse.json({ error: 'INVALID_DOCUMENT_FIELDS' }, { status: 400 });
    const file = form.get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'DOCUMENT_FILE_REQUIRED' }, { status: 400 });

    const store = getPlatformStore();
    const client = await store.getClient(auth.organizationId, parsed.data.clientId);
    if (!client) return NextResponse.json({ error: 'CLIENT_NOT_FOUND' }, { status: 404 });

    uploaded = await uploadPrivateEvidence({ organizationId: auth.organizationId, clientId: client.id, file });
    const now = new Date().toISOString();
    const record = {
      id: `evidence_${randomUUID()}`,
      organizationId: auth.organizationId,
      clientId: client.id,
      type: 'other' as const,
      label: parsed.data.label,
      sha256: uploaded.sha256,
      vaultRef: uploaded.pathname,
      verification: 'unverified' as const,
      createdAt: now
    };
    await store.appendEvidence(auth.organizationId, record);
    await store.appendAudit(auth.organizationId, {
      id: `audit_${randomUUID()}`,
      organizationId: auth.organizationId,
      actorType: 'user',
      actorId: auth.actorId,
      action: 'document.uploaded',
      resourceType: 'evidence',
      resourceId: record.id,
      decision: 'allowed',
      metadata: { clientId: client.id, category: parsed.data.category, documentClass: 'client_document', filename: file.name, contentType: file.type, bytes: file.size, privateVault: true },
      createdAt: now
    });
    if (parsed.data.shareNow === 'true') {
      await store.appendAudit(auth.organizationId, {
        id: `audit_${randomUUID()}`,
        organizationId: auth.organizationId,
        actorType: 'user',
        actorId: auth.actorId,
        action: 'document.shared',
        resourceType: 'evidence',
        resourceId: record.id,
        decision: 'allowed',
        metadata: { clientId: client.id },
        createdAt: new Date().toISOString()
      });
    }
    return NextResponse.json({ document: record, shared: parsed.data.shareNow === 'true' }, { status: 201 });
  } catch (error) {
    if (uploaded) { try { await uploaded.cleanup(); } catch {} }
    return NextResponse.json({ error: error instanceof Error ? error.message : 'DOCUMENT_UPLOAD_FAILED' }, { status: 503 });
  }
}