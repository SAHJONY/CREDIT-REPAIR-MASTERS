import { randomUUID } from 'node:crypto';
import { get } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { getBusinessSession } from '@/lib/session-access';
import { getCustomerPortalSession } from '@/lib/customer-portal';
import { getPlatformStore } from '@/lib/platform-store';
import { isDocumentShared } from '@/lib/document-sharing';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getBusinessSession();
  if (!session) return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });
  if (session.mfaRequired && !session.mfaAssured) return NextResponse.json({ error: 'MFA_REQUIRED' }, { status: 403 });
  const { id } = await params;
  const store = getPlatformStore();
  const audit = await store.listAudit(session.organizationId, 500);
  let document = null as Awaited<ReturnType<typeof store.listEvidence>>[number] | null;
  let clientId = '';

  if (session.member.role === 'client') {
    const portal = await getCustomerPortalSession();
    if (!portal) return NextResponse.json({ error: 'PORTAL_ACCESS_REQUIRED' }, { status: 403 });
    clientId = portal.client.id;
    const evidence = await store.listEvidence(session.organizationId, clientId);
    document = evidence.find((item) => item.id === id) ?? null;
    if (!document || !isDocumentShared(audit, id)) return NextResponse.json({ error: 'DOCUMENT_NOT_SHARED' }, { status: 404 });
  } else {
    if (!['owner','admin','credit_specialist','compliance_reviewer','auditor'].includes(session.member.role)) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    const clients = await store.listClients(session.organizationId);
    for (const client of clients) {
      const evidence = await store.listEvidence(session.organizationId, client.id);
      const found = evidence.find((item) => item.id === id);
      if (found) { document = found; clientId = client.id; break; }
    }
    if (!document) return NextResponse.json({ error: 'DOCUMENT_NOT_FOUND' }, { status: 404 });
  }

  if (!document.vaultRef) return NextResponse.json({ error: 'DOCUMENT_FILE_NOT_AVAILABLE' }, { status: 404 });
  const result = await get(document.vaultRef, { access: 'private' });
  if (!result || result.statusCode !== 200) return NextResponse.json({ error: 'DOCUMENT_FILE_NOT_FOUND' }, { status: 404 });

  await store.appendAudit(session.organizationId, {
    id: `audit_${randomUUID()}`,
    organizationId: session.organizationId,
    actorType: 'user',
    actorId: session.member.id,
    action: 'document.viewed',
    resourceType: 'evidence',
    resourceId: document.id,
    decision: 'allowed',
    metadata: { clientId, role: session.member.role },
    createdAt: new Date().toISOString()
  });

  return new NextResponse(result.stream, {
    headers: {
      'Content-Type': result.blob.contentType || 'application/octet-stream',
      'Content-Disposition': result.blob.contentDisposition || `inline; filename="document"`,
      'Cache-Control': 'private, no-store'
    }
  });
}