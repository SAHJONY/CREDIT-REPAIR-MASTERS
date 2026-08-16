import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

type InvitePayload = {
  v: 1;
  organizationId: string;
  clientId: string;
  emailHash: string;
  exp: number;
};

function secret() {
  const value = process.env.PORTAL_INVITE_SECRET?.trim() || process.env.MFA_ENCRYPTION_KEY?.trim() || '';
  if (value.length < 32) throw new Error('PORTAL_INVITE_SECRET_NOT_CONFIGURED');
  return value;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function emailHash(email: string) {
  return createHash('sha256').update(normalizeEmail(email)).digest('hex');
}

function sign(value: string) {
  return createHmac('sha256', secret()).update(`customer-portal-invite:v1:${value}`).digest('base64url');
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function createCustomerPortalInvite(input: { organizationId: string; clientId: string; email: string; ttlHours?: number }) {
  const payload: InvitePayload = {
    v: 1,
    organizationId: input.organizationId,
    clientId: input.clientId,
    emailHash: emailHash(input.email),
    exp: Date.now() + (input.ttlHours ?? 72) * 60 * 60 * 1000
  };
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  return `${encoded}.${sign(encoded)}`;
}

export function verifyCustomerPortalInvite(token: string, email: string): InvitePayload {
  const [encoded, signature, extra] = token.split('.');
  if (!encoded || !signature || extra) throw new Error('PORTAL_INVITE_INVALID');
  if (!safeEqual(signature, sign(encoded))) throw new Error('PORTAL_INVITE_INVALID');

  let payload: InvitePayload;
  try {
    payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as InvitePayload;
  } catch {
    throw new Error('PORTAL_INVITE_INVALID');
  }

  if (payload.v !== 1 || !payload.organizationId || !payload.clientId || !payload.emailHash || !payload.exp) throw new Error('PORTAL_INVITE_INVALID');
  if (payload.exp <= Date.now()) throw new Error('PORTAL_INVITE_EXPIRED');
  if (!safeEqual(payload.emailHash, emailHash(email))) throw new Error('PORTAL_INVITE_EMAIL_MISMATCH');
  return payload;
}
