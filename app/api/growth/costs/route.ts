import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateBusinessUser, authorizeRoles } from '@/lib/api-auth';
import { getPlatformStore } from '@/lib/platform-store';

const schema = z.object({
  acquisitionSpendCents: z.number().int().min(0).max(100_000_000),
  fulfillmentLaborCents: z.number().int().min(0).max(100_000_000),
  softwareAiCents: z.number().int().min(0).max(100_000_000),
  note: z.string().trim().max(180).optional().default('')
});

export async function POST(request: NextRequest) {
  const auth = authorizeRoles(await authenticateBusinessUser(request), ['owner', 'admin']);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'INVALID_COST_SNAPSHOT' }, { status: 400 });

  const id = `growthcost_${randomUUID()}`;
  await getPlatformStore().appendAudit(auth.organizationId, {
    id: `audit_${randomUUID()}`,
    organizationId: auth.organizationId,
    actorType: 'user',
    actorId: auth.actorId,
    action: 'growth.cost_snapshot',
    resourceType: 'growth_cost_snapshot',
    resourceId: id,
    decision: 'allowed',
    metadata: {
      periodDays: 30,
      acquisitionSpendCents: parsed.data.acquisitionSpendCents,
      fulfillmentLaborCents: parsed.data.fulfillmentLaborCents,
      softwareAiCents: parsed.data.softwareAiCents,
      note: parsed.data.note
    },
    createdAt: new Date().toISOString()
  });

  return NextResponse.json({ saved: true, id, periodDays: 30 }, { status: 201 });
}
