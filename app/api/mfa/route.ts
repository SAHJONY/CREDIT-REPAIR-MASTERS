import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { getBusinessSession } from '@/lib/session-access';
import { beginMfaEnrollment, createMfaAssurance, getMfaStatus, verifyEnrollment, verifyMfaChallenge } from '@/lib/mfa';

const actionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('enroll') }),
  z.object({ action: z.literal('verify_enrollment'), code: z.string().min(6).max(32) }),
  z.object({ action: z.literal('challenge'), code: z.string().min(6).max(32) })
]);

function privileged(role: string) {
  return role === 'owner' || role === 'admin';
}

export async function GET() {
  const session = await getBusinessSession();
  if (!session) return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 });
  if (!privileged(session.member.role)) return NextResponse.json({ required: false, enrolled: false });
  const status = await getMfaStatus(session.organizationId, session.member.id);
  return NextResponse.json({ required: true, ...status });
}

export async function POST(request: Request) {
  const session = await getBusinessSession();
  if (!session) return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 });
  if (!privileged(session.member.role)) return NextResponse.json({ error: 'MFA_NOT_REQUIRED_FOR_ROLE' }, { status: 403 });
  const parsed = actionSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'INVALID_MFA_INPUT' }, { status: 400 });

  try {
    if (parsed.data.action === 'enroll') {
      const enrollment = await beginMfaEnrollment({ organizationId: session.organizationId, userId: session.member.id, email: session.email });
      return NextResponse.json(enrollment);
    }

    if (parsed.data.action === 'verify_enrollment') {
      const ok = await verifyEnrollment({ organizationId: session.organizationId, userId: session.member.id, code: parsed.data.code });
      if (!ok) return NextResponse.json({ error: 'MFA_CODE_INVALID' }, { status: 400 });
    } else {
      const result = await verifyMfaChallenge({ organizationId: session.organizationId, userId: session.member.id, code: parsed.data.code });
      if (!result.ok) return NextResponse.json({ error: result.reason }, { status: result.reason === 'MFA_LOCKED' ? 423 : 400 });
    }

    const assurance = await createMfaAssurance({ organizationId: session.organizationId, userId: session.member.id });
    const jar = await cookies();
    jar.set('crm_mfa', assurance.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: assurance.expiresAt
    });
    return NextResponse.json({ ok: true, assuranceExpiresAt: assurance.expiresAt.toISOString() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'MFA_OPERATION_FAILED';
    const status = message.includes('NOT_CONFIGURED') ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
