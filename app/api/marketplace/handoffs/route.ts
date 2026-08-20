import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateBusinessUser, authorizeRoles } from '@/lib/api-auth';
import { consentIsActive } from '@/lib/customer-portal';
import { appendMarketplaceHandoff, listEligibleMarketplacePartners, listMarketplaceHandoffs } from '@/lib/marketplace-store';
import { getPlatformStore } from '@/lib/platform-store';

const schema = z.object({
  clientId: z.string().trim().min(1),
  partnerId: z.string().trim().min(1),
  vertical: z.enum(['loans','auto','mortgage','business','marketplace']),
  readinessScore: z.number().int().min(0).max(100),
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).default({})
});

export async function GET(request: NextRequest) {
  const auth = authorizeRoles(await authenticateBusinessUser(request), ['owner','admin','compliance_reviewer','auditor']);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const handoffs = await listMarketplaceHandoffs(auth.organizationId, 100);
  return NextResponse.json({ handoffs });
}

export async function POST(request: NextRequest) {
  const auth = authorizeRoles(await authenticateBusinessUser(request), ['owner','admin','credit_specialist']);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'INVALID_MARKETPLACE_HANDOFF', issues: parsed.error.flatten() }, { status: 400 });

  const store = getPlatformStore();
  const client = await store.getClient(auth.organizationId, parsed.data.clientId);
  if (!client) return NextResponse.json({ error: 'CLIENT_NOT_FOUND' }, { status: 404 });

  const consents = await store.listConsents(auth.organizationId, client.id);
  const sharingConsent = consents
    .filter((consent) => consent.scope === 'marketplace_partner_sharing')
    .sort((a, b) => Date.parse(b.grantedAt) - Date.parse(a.grantedAt))[0];
  if (!sharingConsent || !consentIsActive(sharingConsent)) {
    return NextResponse.json({ error: 'MARKETPLACE_PARTNER_SHARING_CONSENT_REQUIRED' }, { status: 409 });
  }

  const eligible = await listEligibleMarketplacePartners(auth.organizationId, parsed.data.vertical, parsed.data.readinessScore, client.state);
  const partner = eligible.find((candidate) => candidate.id === parsed.data.partnerId);
  if (!partner) return NextResponse.json({ error: 'PARTNER_NOT_ELIGIBLE_FOR_CLIENT_PROFILE' }, { status: 409 });

  const now = new Date().toISOString();
  const handoff = await appendMarketplaceHandoff(auth.organizationId, {
    id: `handoff_${randomUUID()}`,
    organizationId: auth.organizationId,
    clientId: client.id,
    partnerId: partner.id,
    vertical: parsed.data.vertical,
    readinessScore: parsed.data.readinessScore,
    consentRecorded: true,
    status: 'created',
    source: 'new850_marketplace',
    metadata: parsed.data.metadata,
    createdAt: now,
    updatedAt: now
  });

  await store.appendAudit(auth.organizationId, {
    id: `audit_${randomUUID()}`,
    organizationId: auth.organizationId,
    actorType: 'user',
    actorId: auth.actorId,
    action: 'marketplace.handoff.create',
    resourceType: 'marketplace_handoff',
    resourceId: handoff.id,
    decision: 'allowed',
    metadata: { clientId: client.id, partnerId: partner.id, vertical: parsed.data.vertical, readinessScore: parsed.data.readinessScore, consentId: sharingConsent.id },
    createdAt: now
  });

  return NextResponse.json({ handoff, partner: { id: partner.id, name: partner.name, disclosure: partner.disclosure } }, { status: 201 });
}
