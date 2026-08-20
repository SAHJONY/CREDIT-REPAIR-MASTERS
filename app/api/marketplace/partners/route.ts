import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateBusinessUser, authorizeRoles } from '@/lib/api-auth';
import { listMarketplacePartners, upsertMarketplacePartner } from '@/lib/marketplace-store';

const verticalSchema = z.enum(['loans','auto','mortgage','business','marketplace']);
const partnerSchema = z.object({
  id: z.string().trim().min(1).optional(),
  name: z.string().trim().min(2).max(120),
  vertical: verticalSchema,
  status: z.enum(['inactive','active','paused']).default('inactive'),
  minReadiness: z.number().int().min(0).max(100).default(0),
  states: z.array(z.string().trim().min(2).max(2)).max(60).default([]),
  eligibility: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).default({}),
  disclosure: z.string().trim().max(1000).default('')
});

export async function GET(request: NextRequest) {
  const auth = authorizeRoles(await authenticateBusinessUser(request), ['owner','admin','compliance_reviewer','auditor']);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const verticalRaw = request.nextUrl.searchParams.get('vertical');
  const parsedVertical = verticalRaw ? verticalSchema.safeParse(verticalRaw) : null;
  if (parsedVertical && !parsedVertical.success) return NextResponse.json({ error: 'INVALID_MARKETPLACE_VERTICAL' }, { status: 400 });
  const partners = await listMarketplacePartners(auth.organizationId, parsedVertical?.success ? parsedVertical.data : undefined);
  return NextResponse.json({ partners });
}

export async function POST(request: NextRequest) {
  const auth = authorizeRoles(await authenticateBusinessUser(request), ['owner','admin']);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const parsed = partnerSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'INVALID_MARKETPLACE_PARTNER', issues: parsed.error.flatten() }, { status: 400 });
  const now = new Date().toISOString();
  const partner = await upsertMarketplacePartner(auth.organizationId, {
    id: parsed.data.id || `partner_${randomUUID()}`,
    organizationId: auth.organizationId,
    name: parsed.data.name,
    vertical: parsed.data.vertical,
    status: parsed.data.status,
    minReadiness: parsed.data.minReadiness,
    states: parsed.data.states.map((state) => state.toUpperCase()),
    eligibility: parsed.data.eligibility,
    disclosure: parsed.data.disclosure,
    createdAt: now,
    updatedAt: now
  });
  return NextResponse.json({ partner }, { status: 201 });
}
