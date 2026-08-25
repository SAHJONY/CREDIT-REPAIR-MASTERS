import { randomUUID } from 'node:crypto';
import { get } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { getBusinessSession } from '@/lib/session-access';
import { documentMetadata } from '@/lib/document-sharing';
import { signatureMatchesCurrentVersion } from '@/lib/document-workflow';
import { getPlatformStore } from '@/lib/platform-store';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getBusinessSession();
  if (!session) return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });
  if (session.mfaRequired && !session.mfaAssured) return NextResponse.json({ error: 'MFA_REQUIRED' }, { status: 403 });
  if (!['owner','admin','credit_specialist','compliance_reviewer','auditor'].includes(session.member.role)) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }

  const { id } = await params;
  const store = getPlatformStore();
  const [clients, audit] = await Promise.all([
    store.listClients(session.organizationId),
    store.listAudit(session.organizationId, 1000)
  ]);
  let document = null as Awaited<ReturnType<typeof store.listEvidence>>[number] | null;
  let clientId = '';
  for (const client of clients) {
    const evidence = await store.listEvidence(session.organizationId, client.id);
    const found = evidence.find((item) => item.id === id);
    if (found) { document = found; clientId = client.id; break; }
  }
  if (!document) return NextResponse.json({ error: 'DOCUMENT_NOT_FOUND' }, { status: 404 });

  const metadata = documentMetadata(audit, document);
  if (metadata.documentClass !== 'client_document' || metadata.category !== 'dispute') {
    return NextResponse.json({ error: 'DISPUTE_LETTER_REQUIRED' }, { status: 409 });
  }
  if (!signatureMatchesCurrentVersion(audit, document)) {
    return NextResponse.json({ error: 'CURRENT_VERSION_NOT_SIGNED' }, { status: 409 });
  }
  if (!document.vaultRef) return NextResponse.json({ error: 'DOCUMENT_FILE_NOT_AVAILABLE' }, { status: 404 });

  const result = await get(document.vaultRef, { access: 'private' });
  if (!result || result.statusCode !== 200) return NextResponse.json({ error: 'DOCUMENT_FILE_NOT_FOUND' }, { status: 404 });

  await store.appendAudit(session.organizationId, {
    id: `audit_${randomUUID()}`,
    organizationId: session.organizationId,
    actorType: 'user',
    actorId: session.member.id,
    action: 'document.printed',
    resourceType: 'evidence',
    resourceId: document.id,
    decision: 'allowed',
    metadata: { clientId, documentSha256: document.sha256 || '', role: session.member.role },
    createdAt: new Date().toISOString()
  });

  const safeName = (metadata.filename || `${document.id}.pdf`).replace(/[^a-zA-Z0-9._-]+/g, '-');
  return new NextResponse(result.stream, {
    headers: {
      'Content-Type': result.blob.contentType || 'application/pdf',
      'Content-Disposition': `inline; filename="${safeName}"`,
      'Cache-Control': 'private, no-store',
      'X-New850-Print-Ready': 'true'
    }
  });
}
