import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateBusinessUser, authorizeRoles } from '@/lib/api-auth';
import { getCustomerAccessByMember } from '@/lib/customer-portal';
import { getPlatformStore } from '@/lib/platform-store';

const schema = z.object({
  scope: z.enum(['credit_report_analysis','dispute_drafting','dispute_submission']),
  granted: z.boolean()
});

export async function POST(request: NextRequest) {
  const auth = authorizeRoles(await authenticateBusinessUser(request), ['client']);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'INVALID_PORTAL_CONSENT' }, { status: 400 });
  const access = await getCustomerAccessByMember(auth.organizationId, auth.actorId);
  if (!access) return NextResponse.json({ error: 'CUSTOMER_CLIENT_ACCESS_REQUIRED' }, { status: 403 });
  const store = getPlatformStore();
  const client = await store.getClient(auth.organizationId, access.client_id);
  if (!client) return NextResponse.json({ error: 'CLIENT_NOT_FOUND' }, { status: 404 });
  const now = new Date().toISOString();
  const record = {
    id: `consent_${randomUUID()}`,
    organizationId: auth.organizationId,
    clientId: client.id,
    scope: parsed.data.scope,
    granted: parsed.data.granted,
    source: 'client_portal' as const,
    grantedAt: now
  };
  await store.appendConsent(auth.organizationId, record);
  await store.appendAudit(auth.organizationId, {
    id: `audit_${randomUUID()}`, organizationId: auth.organizationId, actorType: 'user', actorId: auth.actorId,
    action: 'client_portal.consent', resourceType: 'consent', resourceId: record.id,
    decision: parsed.data.granted ? 'allowed' : 'blocked', metadata: { clientId: client.id, scope: record.scope, source: 'client_portal', granted: record.granted }, createdAt: now
  });
  return NextResponse.json({ consent: record }, { status: 201 });
}
