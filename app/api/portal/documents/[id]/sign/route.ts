import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCustomerPortalSession } from '@/lib/customer-portal';
import { getPlatformStore } from '@/lib/platform-store';
import { isDocumentShared } from '@/lib/document-sharing';
import { signatureMatchesCurrentVersion, signatureRequest } from '@/lib/document-workflow';

const bodySchema = z.object({
  signerName: z.string().trim().min(2).max(160),
  confirmAccuracy: z.literal(true),
  authorizeSending: z.literal(true)
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const portal = await getCustomerPortalSession();
  if (!portal) return NextResponse.json({ error: 'PORTAL_ACCESS_REQUIRED' }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'SIGNATURE_CONFIRMATIONS_REQUIRED' }, { status: 400 });

  const { id } = await params;
  const store = getPlatformStore();
  const [evidence, audit] = await Promise.all([
    store.listEvidence(portal.organizationId, portal.client.id),
    store.listAudit(portal.organizationId, 500)
  ]);
  const document = evidence.find((item) => item.id === id);
  if (!document || !isDocumentShared(audit, id)) return NextResponse.json({ error: 'DOCUMENT_NOT_AVAILABLE' }, { status: 404 });
  if (!signatureRequest(audit, id)) return NextResponse.json({ error: 'SIGNATURE_NOT_REQUESTED' }, { status: 409 });
  if (!document.sha256) return NextResponse.json({ error: 'DOCUMENT_VERSION_NOT_LOCKED' }, { status: 409 });
  if (signatureMatchesCurrentVersion(audit, document)) return NextResponse.json({ signed: true, alreadySigned: true });

  const now = new Date().toISOString();
  await store.appendAudit(portal.organizationId, {
    id: `audit_${randomUUID()}`,
    organizationId: portal.organizationId,
    actorType: 'user',
    actorId: portal.member.id,
    action: 'document.signed',
    resourceType: 'evidence',
    resourceId: document.id,
    decision: 'allowed',
    metadata: {
      clientId: portal.client.id,
      documentSha256: document.sha256,
      signerName: parsed.data.signerName,
      signerEmail: portal.email,
      confirmAccuracy: true,
      authorizeSending: true,
      signatureMethod: 'typed_name_portal'
    },
    createdAt: now
  });

  return NextResponse.json({ signed: true, signedAt: now, documentSha256: document.sha256 });
}
