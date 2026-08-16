import { timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { configuredOrganizationId } from '@/lib/api-auth';
import { getNeonAuth, neonAuthConfigured } from '@/lib/auth/server';
import { getPlatformStore } from '@/lib/platform-store';

const schema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(12).max(200),
  activationCode: z.string().min(16).max(300)
});

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left, 'utf8');
  const b = Buffer.from(right, 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}

function providerErrorCode(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as { code?: unknown; error?: unknown; message?: unknown };
  const nested = candidate.error && typeof candidate.error === 'object'
    ? candidate.error as { code?: unknown; message?: unknown }
    : null;
  const raw = typeof nested?.code === 'string'
    ? nested.code
    : typeof candidate.code === 'string'
      ? candidate.code
      : typeof nested?.message === 'string'
        ? nested.message
        : typeof candidate.message === 'string'
          ? candidate.message
          : '';
  const normalized = raw.trim().toUpperCase().replace(/[^A-Z0-9_-]+/g, '_').slice(0, 96);
  return normalized || null;
}

function activationFailure(providerCode: string | null) {
  console.warn(JSON.stringify({
    level: 'warn',
    service: 'credit-repair-masters',
    event: 'owner_activation.provider_rejected',
    providerCode: providerCode || 'UNKNOWN'
  }));
  return NextResponse.json(
    { error: 'OWNER_ACTIVATION_FAILED', providerCode: providerCode || 'UNKNOWN' },
    { status: 409 }
  );
}

export async function POST(request: NextRequest) {
  if (!neonAuthConfigured()) return NextResponse.json({ error: 'AUTH_NOT_CONFIGURED' }, { status: 503 });
  const expectedActivationCode = process.env.OWNER_ACTIVATION_SECRET?.trim();
  if (!expectedActivationCode) return NextResponse.json({ error: 'OWNER_ACTIVATION_DISABLED' }, { status: 503 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'INVALID_ACTIVATION_PAYLOAD' }, { status: 400 });
  if (!safeEqual(parsed.data.activationCode, expectedActivationCode)) return NextResponse.json({ error: 'OWNER_ACTIVATION_DENIED' }, { status: 403 });

  const organizationId = configuredOrganizationId();
  const members = await getPlatformStore().listUsers(organizationId);
  const owner = members.find((member) => member.status === 'active' && member.role === 'owner' && member.email.trim().toLowerCase() === parsed.data.email);
  if (!owner) return NextResponse.json({ error: 'OWNER_EMAIL_NOT_AUTHORIZED' }, { status: 403 });

  try {
    const result = await getNeonAuth().signUp.email({
      email: parsed.data.email,
      password: parsed.data.password,
      name: 'CREDIT REPAIR MASTERS Owner'
    });
    if (result && typeof result === 'object' && 'error' in result && result.error) {
      return activationFailure(providerErrorCode(result));
    }
    return NextResponse.json({ activated: true, email: parsed.data.email }, { status: 201 });
  } catch (error) {
    return activationFailure(providerErrorCode(error));
  }
}
