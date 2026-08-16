import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateBusinessUser, authorizeRoles } from '@/lib/api-auth';
import { consentIsActive, getCustomerAccessByMember } from '@/lib/customer-portal';
import { uploadPrivateEvidence } from '@/lib/evidence-vault';
import { getPlatformStore } from '@/lib/platform-store';

const schema = z.object({
  providerId: z.string().trim().min(2).max(120),
  providerName: z.string().trim().min(2).max(160),
  reportDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

export async function POST(request: NextRequest) {
  const auth = authorizeRoles(await authenticateBusinessUser(request), ['client']);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const access = await getCustomerAccessByMember(auth.organizationId, auth.actorId);
  if (!access) return NextResponse.json({ error: 'CUSTOMER_CLIENT_ACCESS_REQUIRED' }, { status: 403 });
  const form = await request.formData();
  const parsed = schema.safeParse({ providerId: form.get('providerId'), providerName: form.get('providerName'), reportDate: form.get('reportDate') });
  if (!parsed.success) return NextResponse.json({ error: 'INVALID_CREDIT_REPORT_FIELDS' }, { status: 400 });
  const file = form.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'EVIDENCE_FILE_REQUIRED' }, { status: 400 });

  const store = getPlatformStore();
  const client = await store.getClient(auth.organizationId, access.client_id);
  if (!client) return NextResponse.json({ error: 'CLIENT_NOT_FOUND' }, { status: 404 });
  const consents = await store.listConsents(auth.organizationId, client.id);
  if (!consents.some((c) => c.scope === 'credit_report_analysis' && consentIsActive(c))) {
    return NextResponse.json({ error: 'CREDIT_REPORT_ANALYSIS_CONSENT_REQUIRED' }, { status: 403 });
  }

  let uploaded: Awaited<ReturnType<typeof uploadPrivateEvidence>> | null = null;
  try {
    uploaded = await uploadPrivateEvidence({ organizationId: auth.organizationId, clientId: client.id, file });
    const now = new Date().toISOString();
    const record = {
      id: `evidence_${randomUUID()}`, organizationId: auth.organizationId, clientId: client.id,
      type: 'credit_report' as const,
      label: `${parsed.data.providerName} credit report ${parsed.data.reportDate}`,
      sha256: uploaded.sha256, vaultRef: uploaded.pathname, verification: 'unverified' as const, createdAt: now
    };
    await store.appendEvidence(auth.organizationId, record);
    await store.appendAudit(auth.organizationId, {
      id: `audit_${randomUUID()}`, organizationId: auth.organizationId, actorType: 'user', actorId: auth.actorId,
      action: 'client_portal.credit_report_upload', resourceType: 'evidence', resourceId: record.id, decision: 'allowed',
      metadata: { clientId: client.id, providerId: parsed.data.providerId, bytes: uploaded.size, contentType: uploaded.contentType, privateVault: true, checksumPresent: true }, createdAt: now
    });
    return NextResponse.json({ evidence: record, storage: { private: true }, note: 'Your report is stored privately and awaiting review.' }, { status: 201 });
  } catch (error) {
    if (uploaded) { try { await uploaded.cleanup(); } catch {} }
    return NextResponse.json({ error: error instanceof Error ? error.message : 'PORTAL_UPLOAD_FAILED' }, { status: 503 });
  }
}
