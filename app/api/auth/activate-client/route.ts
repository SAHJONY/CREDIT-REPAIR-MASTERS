import { randomUUID } from 'node:crypto';
import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getNeonAuth, neonAuthConfigured } from '@/lib/auth/server';
import { verifyCustomerPortalInvite } from '@/lib/customer-invite';
import { getPlatformStore } from '@/lib/platform-store';

const schema = z.object({
  token: z.string().min(40).max(4000),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(12).max(200)
});

function providerErrorCode(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as { code?: unknown; error?: unknown; message?: unknown };
  const nested = candidate.error && typeof candidate.error === 'object' ? candidate.error as { code?: unknown; message?: unknown } : null;
  const raw = typeof nested?.code === 'string' ? nested.code : typeof candidate.code === 'string' ? candidate.code : typeof nested?.message === 'string' ? nested.message : typeof candidate.message === 'string' ? candidate.message : '';
  return raw.trim().toUpperCase().replace(/[^A-Z0-9_-]+/g, '_').slice(0, 96) || null;
}

export async function POST(request: NextRequest) {
  if (!neonAuthConfigured()) return NextResponse.json({ error: 'AUTH_NOT_CONFIGURED' }, { status: 503 });
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) return NextResponse.json({ error: 'PRODUCTION_DATABASE_NOT_CONFIGURED' }, { status: 503 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'INVALID_CLIENT_ACTIVATION_PAYLOAD' }, { status: 400 });

  let invite;
  try {
    invite = verifyCustomerPortalInvite(parsed.data.token, parsed.data.email);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'PORTAL_INVITE_INVALID' }, { status: 403 });
  }

  const store = getPlatformStore();
  const client = await store.getClient(invite.organizationId, invite.clientId);
  if (!client || client.status === 'closed') return NextResponse.json({ error: 'CLIENT_PORTAL_ACTIVATION_BLOCKED' }, { status: 409 });

  const sql = neon(databaseUrl);
  const existingMembers = await sql`select id, role, status from app_users where organization_id = ${invite.organizationId} and lower(email) = ${parsed.data.email} limit 1`;
  if (existingMembers[0]) return NextResponse.json({ error: 'PORTAL_ACCOUNT_ALREADY_PROVISIONED', signInUrl: '/portal/sign-in' }, { status: 409 });

  try {
    const signup = await getNeonAuth().signUp.email({ email: parsed.data.email, password: parsed.data.password, name: client.displayName });
    if (signup && typeof signup === 'object' && 'error' in signup && signup.error) {
      return NextResponse.json({ error: 'CLIENT_AUTH_ACTIVATION_FAILED', providerCode: providerErrorCode(signup) || 'UNKNOWN' }, { status: 409 });
    }

    const memberId = `usr_client_${randomUUID()}`;
    const accessId = `cca_${randomUUID()}`;
    await sql`insert into app_users (id, organization_id, email, role, status, created_at) values (${memberId}, ${invite.organizationId}, ${parsed.data.email}, 'client', 'active', now())`;
    try {
      await sql`insert into customer_client_access (id, organization_id, user_id, client_id, status, created_at) values (${accessId}, ${invite.organizationId}, ${memberId}, ${invite.clientId}, 'active', now())`;
    } catch (error) {
      await sql`delete from app_users where organization_id = ${invite.organizationId} and id = ${memberId}`;
      throw error;
    }

    await store.appendAudit(invite.organizationId, {
      id: `audit_${randomUUID()}`,
      organizationId: invite.organizationId,
      actorType: 'system',
      actorId: memberId,
      action: 'client.portal_activated',
      resourceType: 'client',
      resourceId: invite.clientId,
      decision: 'allowed',
      metadata: { clientId: invite.clientId },
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ activated: true, signInUrl: '/portal/sign-in' }, { status: 201 });
  } catch (error) {
    console.error('client portal activation failed', providerErrorCode(error) || 'UNKNOWN');
    return NextResponse.json({ error: 'CLIENT_PORTAL_ACTIVATION_FAILED' }, { status: 503 });
  }
}
