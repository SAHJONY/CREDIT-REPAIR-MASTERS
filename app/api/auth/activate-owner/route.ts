import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { configuredOrganizationId } from '@/lib/api-auth';
import { getNeonAuth, neonAuthConfigured } from '@/lib/auth/server';
import { getPlatformStore } from '@/lib/platform-store';

const schema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(12).max(200)
});

export async function POST(request: NextRequest) {
  if (!neonAuthConfigured()) return NextResponse.json({ error: 'AUTH_NOT_CONFIGURED' }, { status: 503 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'INVALID_ACTIVATION_PAYLOAD' }, { status: 400 });

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
      return NextResponse.json({ error: 'OWNER_ACTIVATION_FAILED' }, { status: 409 });
    }
    return NextResponse.json({ activated: true, email: parsed.data.email }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'OWNER_ACTIVATION_FAILED' }, { status: 409 });
  }
}
