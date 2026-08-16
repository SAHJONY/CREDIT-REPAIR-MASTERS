import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateBusinessUser, authorizeRoles } from '@/lib/api-auth';
import { createCustomerPortalInvite } from '@/lib/customer-invite';
import { getPlatformStore } from '@/lib/platform-store';

const schema = z.object({ email: z.string().trim().email().transform((value) => value.toLowerCase()) });

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = authorizeRoles(await authenticateBusinessUser(request), ['owner', 'admin', 'credit_specialist']);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'INVALID_PORTAL_INVITE_PAYLOAD' }, { status: 400 });

  const { id } = await params;
  const store = getPlatformStore();
  const client = await store.getClient(auth.organizationId, id);
  if (!client) return NextResponse.json({ error: 'CLIENT_NOT_FOUND' }, { status: 404 });
  if (client.status === 'closed') return NextResponse.json({ error: 'CLIENT_PORTAL_INVITE_BLOCKED' }, { status: 409 });

  try {
    const token = createCustomerPortalInvite({ organizationId: auth.organizationId, clientId: client.id, email: parsed.data.email, ttlHours: 72 });
    const inviteUrl = new URL('/portal/activate', request.nextUrl.origin);
    inviteUrl.searchParams.set('token', token);

    await store.appendAudit(auth.organizationId, {
      id: `audit_${randomUUID()}`,
      organizationId: auth.organizationId,
      actorType: 'user',
      actorId: auth.actorId,
      action: 'client.portal_invite_created',
      resourceType: 'client',
      resourceId: client.id,
      decision: 'allowed',
      metadata: { clientId: client.id, invitedEmail: parsed.data.email, expiresInHours: 72 },
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ clientId: client.id, email: parsed.data.email, inviteUrl: inviteUrl.toString(), expiresInHours: 72 }, { status: 201 });
  } catch (error) {
    const code = error instanceof Error ? error.message : 'PORTAL_INVITE_CREATE_FAILED';
    return NextResponse.json({ error: code }, { status: 503 });
  }
}
