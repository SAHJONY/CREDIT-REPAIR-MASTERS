import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateBusinessUser, authorizeRoles } from '@/lib/api-auth';
import { getPlatformStore } from '@/lib/platform-store';

const bodySchema = z.object({ clientId: z.string().trim().min(3).max(160), shared: z.boolean() });

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = authorizeRoles(await authenticateBusinessUser(request), ['owner','admin','credit_specialist','compliance_reviewer']);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'INVALID_DOCUMENT_SHARE_REQUEST' }, { status: 400 });
  const { id } = await params;
  const store = getPlatformStore();
  const client = await store.getClient(auth.organizationId, parsed.data.clientId);
  if (!client) return NextResponse.json({ error: 'CLIENT_NOT_FOUND' }, { status: 404 });
  const evidence = await store.listEvidence(auth.organizationId, client.id);
  const document = evidence.find((item) => item.id === id);
  if (!document) return NextResponse.json({ error: 'DOCUMENT_NOT_FOUND' }, { status: 404 });
  const now = new Date().toISOString();
  await store.appendAudit(auth.organizationId, {
    id: `audit_${randomUUID()}`,
    organizationId: auth.organizationId,
    actorType: 'user',
    actorId: auth.actorId,
    action: parsed.data.shared ? 'document.shared' : 'document.unshared',
    resourceType: 'evidence',
    resourceId: id,
    decision: 'allowed',
    metadata: { clientId: client.id },
    createdAt: now
  });
  return NextResponse.json({ id, shared: parsed.data.shared });
}