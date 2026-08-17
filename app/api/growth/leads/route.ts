import { createHash, randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { configuredOrganizationId } from '@/lib/api-auth';
import { deliverGrowthLead } from '@/lib/growth-leads';
import { getPlatformStore } from '@/lib/platform-store';
import { getCommercialService } from '@/lib/service-catalog';

export const dynamic = 'force-dynamic';

const schema = z.object({
  serviceId: z.string().min(1).max(80),
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().max(30).optional().default(''),
  state: z.string().trim().length(2).transform((value) => value.toUpperCase()),
  goal: z.string().trim().min(5).max(700),
  consent: z.literal(true),
  website: z.string().max(0).optional().default(''),
  source: z.string().trim().max(80).optional().default('direct'),
  medium: z.string().trim().max(80).optional().default(''),
  campaign: z.string().trim().max(120).optional().default('')
});

const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function requestKey(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip')?.trim() || 'unknown';
  return createHash('sha256').update(ip).digest('hex').slice(0, 24);
}

function rateLimited(key: string) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  current.count += 1;
  attempts.set(key, current);
  return current.count > MAX_ATTEMPTS;
}

function leadKey(email: string) {
  return createHash('sha256').update(email.trim().toLowerCase()).digest('hex').slice(0, 20);
}

export async function POST(request: NextRequest) {
  const key = requestKey(request);
  if (rateLimited(key)) return NextResponse.json({ error: 'TOO_MANY_REQUESTS' }, { status: 429 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'INVALID_LEAD_REQUEST' }, { status: 400 });
  if (parsed.data.website) return NextResponse.json({ received: true }, { status: 202 });

  const service = getCommercialService(parsed.data.serviceId);
  if (!service) return NextResponse.json({ error: 'SERVICE_NOT_FOUND' }, { status: 404 });

  const reference = `lead_${randomUUID()}`;
  const identityKey = leadKey(parsed.data.email);
  const organizationId = configuredOrganizationId();
  const store = getPlatformStore();

  try {
    const delivery = await deliverGrowthLead({
      reference,
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      phone: parsed.data.phone || undefined,
      state: parsed.data.state,
      serviceId: service.id,
      serviceName: service.name,
      audience: service.audience,
      goal: parsed.data.goal,
      source: parsed.data.source || 'direct',
      medium: parsed.data.medium,
      campaign: parsed.data.campaign
    });

    try {
      await store.appendAudit(organizationId, {
        id: `audit_${randomUUID()}`,
        organizationId,
        actorType: 'system',
        actorId: `public:${identityKey}`,
        action: 'growth.lead_submitted',
        resourceType: 'growth_lead',
        resourceId: reference,
        decision: 'allowed',
        metadata: {
          leadKey: identityKey,
          serviceId: service.id,
          audience: service.audience,
          state: parsed.data.state,
          source: parsed.data.source || 'direct',
          medium: parsed.data.medium || '',
          campaign: parsed.data.campaign || '',
          hasPhone: Boolean(parsed.data.phone),
          contactConsent: true,
          deliveryChannel: delivery.channel
        },
        createdAt: new Date().toISOString()
      });
    } catch {
      // The prospect has already been delivered to the approved business channel.
      // Do not fail the customer request solely because analytics persistence is degraded.
    }

    return NextResponse.json({
      received: true,
      reference,
      service: service.name,
      message: 'Qualification request received. No payment was collected.'
    }, { status: 201 });
  } catch (error) {
    const code = error instanceof Error ? error.message : 'LEAD_DELIVERY_FAILED';
    try {
      await store.appendAudit(organizationId, {
        id: `audit_${randomUUID()}`,
        organizationId,
        actorType: 'system',
        actorId: 'public-lead-intake',
        action: 'growth.lead_delivery_failed',
        resourceType: 'growth_lead',
        resourceId: reference,
        decision: 'blocked',
        metadata: {
          serviceId: service.id,
          audience: service.audience,
          state: parsed.data.state,
          errorCode: code
        },
        createdAt: new Date().toISOString()
      });
    } catch {
      // Preserve the fail-closed response without exposing PII or internal database details.
    }
    return NextResponse.json({ error: code }, { status: 503 });
  }
}
