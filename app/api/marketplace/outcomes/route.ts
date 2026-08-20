import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateBusinessUser, authorizeRoles } from '@/lib/api-auth';
import { appendMarketplaceOutcome, listMarketplaceOutcomes } from '@/lib/marketplace-store';
import { getPlatformStore } from '@/lib/platform-store';

const schema = z.object({
  handoffId: z.string().trim().min(1),
  clientId: z.string().trim().min(1),
  partnerId: z.string().trim().min(1),
  outcome: z.enum(['pending','application_started','approved','funded','purchased','declined','withdrawn','unknown']),
  amount: z.number().nonnegative().optional(),
  revenueCents: z.number().int().nonnegative().optional(),
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).default({})
});

export async function GET(request: NextRequest) {
  const auth = authorizeRoles(await authenticateBusinessUser(request), ['owner','admin','compliance_reviewer','auditor']);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const outcomes = await listMarketplaceOutcomes(auth.organizationId, 100);
  return NextResponse.json({ outcomes });
}

export async function POST(request: NextRequest) {
  const auth = authorizeRoles(await authenticateBusinessUser(request), ['owner','admin']);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'INVALID_MARKETPLACE_OUTCOME', issues: parsed.error.flatten() }, { status: 400 });

  const now = new Date().toISOString();
  const outcome = await appendMarketplaceOutcome(auth.organizationId, {
    id: `outcome_${randomUUID()}`,
    organizationId: auth.organizationId,
    handoffId: parsed.data.handoffId,
    clientId: parsed.data.clientId,
    partnerId: parsed.data.partnerId,
    outcome: parsed.data.outcome,
    reportedBy: auth.actorId,
    amount: parsed.data.amount,
    revenueCents: parsed.data.revenueCents,
    metadata: parsed.data.metadata,
    createdAt: now
  });

  const store = getPlatformStore();
  await store.appendAudit(auth.organizationId, {
    id: `audit_${randomUUID()}`,
    organizationId: auth.organizationId,
    actorType: 'user',
    actorId: auth.actorId,
    action: 'marketplace.outcome.record',
    resourceType: 'marketplace_outcome',
    resourceId: outcome.id,
    decision: 'allowed',
    metadata: { handoffId: outcome.handoffId, clientId: outcome.clientId, partnerId: outcome.partnerId, outcome: outcome.outcome, revenueCents: outcome.revenueCents ?? 0 },
    createdAt: now
  });

  return NextResponse.json({ outcome }, { status: 201 });
}
