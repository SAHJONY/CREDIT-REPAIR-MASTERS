import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { neon } from '@neondatabase/serverless';

const PERIOD_SECONDS = 30;
const DIGITS = 6;
const MAX_FAILURES = 5;
const LOCK_MINUTES = 15;
const ASSURANCE_HOURS = 12;

function env(name: string) {
  return process.env[name]?.trim() || '';
}

function sql() {
  const url = env('DATABASE_URL');
  if (!url) throw new Error('DATABASE_URL_NOT_CONFIGURED');
  return neon(url);
}

export function mfaCryptoConfigured() {
  return env('MFA_ENCRYPTION_KEY').length >= 32;
}

function key() {
  const secret = env('MFA_ENCRYPTION_KEY');
  if (secret.length < 32) throw new Error('MFA_ENCRYPTION_KEY_NOT_CONFIGURED');
  return createHash('sha256').update(secret).digest();
}

function encrypt(plaintext: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]).toString('base64url');
}

function decrypt(payload: string) {
  const input = Buffer.from(payload, 'base64url');
  if (input.length < 29) throw new Error('MFA_SECRET_INVALID');
  const iv = input.subarray(0, 12);
  const tag = input.subarray(12, 28);
  const ciphertext = input.subarray(28);
  const decipher = createDecipheriv('aes-256-gcm', key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
function base32Encode(bytes: Buffer) {
  let bits = '';
  for (const byte of bytes) bits += byte.toString(2).padStart(8, '0');
  let out = '';
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.slice(i, i + 5).padEnd(5, '0');
    out += BASE32[Number.parseInt(chunk, 2)];
  }
  return out;
}

function base32Decode(value: string) {
  const clean = value.toUpperCase().replace(/=+$/g, '').replace(/\s+/g, '');
  let bits = '';
  for (const char of clean) {
    const index = BASE32.indexOf(char);
    if (index < 0) throw new Error('MFA_SECRET_INVALID');
    bits += index.toString(2).padStart(5, '0');
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(Number.parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}

function hotp(secret: string, counter: number) {
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(BigInt(counter));
  const digest = createHmac('sha1', base32Decode(secret)).update(buffer).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary = ((digest[offset] & 0x7f) << 24) | ((digest[offset + 1] & 0xff) << 16) | ((digest[offset + 2] & 0xff) << 8) | (digest[offset + 3] & 0xff);
  return String(binary % 10 ** DIGITS).padStart(DIGITS, '0');
}

function safeEqualText(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function verifyTotp(secret: string, code: string, now = Date.now()) {
  if (!/^\d{6}$/.test(code)) return false;
  const counter = Math.floor(now / 1000 / PERIOD_SECONDS);
  return [-1, 0, 1].some((drift) => safeEqualText(hotp(secret, counter + drift), code));
}

function recoveryHash(organizationId: string, userId: string, code: string) {
  return createHmac('sha256', key()).update(`${organizationId}:${userId}:${code.trim().toUpperCase()}`).digest('hex');
}

function recoveryCodes() {
  return Array.from({ length: 10 }, () => `${randomBytes(4).toString('hex').slice(0, 4)}-${randomBytes(4).toString('hex').slice(0, 4)}`.toUpperCase());
}

export async function getMfaStatus(organizationId: string, userId: string) {
  const rows = await sql()`select enabled, verified_at, locked_until from mfa_enrollments where organization_id = ${organizationId} and user_id = ${userId} limit 1`;
  const row = rows[0] as { enabled?: boolean; verified_at?: string; locked_until?: string } | undefined;
  const lockExpiresAt = row?.locked_until ? new Date(row.locked_until) : null;
  const activeLock = lockExpiresAt && lockExpiresAt.getTime() > Date.now() ? lockExpiresAt.toISOString() : null;
  return {
    configured: mfaCryptoConfigured(),
    enrolled: Boolean(row?.enabled && row?.verified_at),
    lockedUntil: activeLock
  };
}

export async function beginMfaEnrollment(input: { organizationId: string; userId: string; email: string }) {
  if (!mfaCryptoConfigured()) throw new Error('MFA_ENCRYPTION_KEY_NOT_CONFIGURED');
  const secret = base32Encode(randomBytes(20));
  const codes = recoveryCodes();
  const encrypted = encrypt(secret);
  const hashes = codes.map((code) => recoveryHash(input.organizationId, input.userId, code));
  const id = `mfa_${randomBytes(12).toString('hex')}`;
  await sql()`insert into mfa_enrollments (id, organization_id, user_id, secret_ciphertext, backup_codes_hash, enabled, failed_attempts, locked_until, created_at, updated_at)
    values (${id}, ${input.organizationId}, ${input.userId}, ${encrypted}, ${hashes}, false, 0, null, now(), now())
    on conflict (organization_id, user_id) do update set secret_ciphertext = excluded.secret_ciphertext, backup_codes_hash = excluded.backup_codes_hash, enabled = false, verified_at = null, failed_attempts = 0, locked_until = null, updated_at = now()`;
  const issuer = encodeURIComponent('New850.com');
  const label = encodeURIComponent(`New850.com:${input.email}`);
  return { secret, recoveryCodes: codes, otpauthUri: `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30` };
}

async function enrollmentRow(organizationId: string, userId: string) {
  const rows = await sql()`select id, secret_ciphertext, backup_codes_hash, enabled, failed_attempts, locked_until from mfa_enrollments where organization_id = ${organizationId} and user_id = ${userId} limit 1`;
  return rows[0] as { id: string; secret_ciphertext: string; backup_codes_hash: string[]; enabled: boolean; failed_attempts: number; locked_until?: string | null } | undefined;
}

async function registerFailure(organizationId: string, userId: string, attempts: number) {
  const next = attempts + 1;
  const shouldLock = next >= MAX_FAILURES;
  await sql()`update mfa_enrollments set failed_attempts = ${shouldLock ? 0 : next}, locked_until = ${shouldLock ? new Date(Date.now() + LOCK_MINUTES * 60_000).toISOString() : null}, updated_at = now() where organization_id = ${organizationId} and user_id = ${userId}`;
}

export async function verifyEnrollment(input: { organizationId: string; userId: string; code: string }) {
  const row = await enrollmentRow(input.organizationId, input.userId);
  if (!row) throw new Error('MFA_ENROLLMENT_NOT_FOUND');
  if (!verifyTotp(decrypt(row.secret_ciphertext), input.code)) {
    await registerFailure(input.organizationId, input.userId, row.failed_attempts || 0);
    return false;
  }
  await sql()`update mfa_enrollments set enabled = true, enrolled_at = coalesce(enrolled_at, now()), verified_at = now(), failed_attempts = 0, locked_until = null, updated_at = now() where organization_id = ${input.organizationId} and user_id = ${input.userId}`;
  return true;
}

export async function verifyMfaChallenge(input: { organizationId: string; userId: string; code: string }) {
  const row = await enrollmentRow(input.organizationId, input.userId);
  if (!row?.enabled) return { ok: false as const, reason: 'MFA_NOT_ENROLLED' };
  if (row.locked_until && new Date(row.locked_until).getTime() > Date.now()) return { ok: false as const, reason: 'MFA_LOCKED' };
  const normalized = input.code.trim().toUpperCase();
  const totpOk = verifyTotp(decrypt(row.secret_ciphertext), normalized);
  const candidateRecoveryHash = recoveryHash(input.organizationId, input.userId, normalized);
  const recoveryIndex = row.backup_codes_hash.findIndex((hash) => safeEqualText(hash, candidateRecoveryHash));
  if (!totpOk && recoveryIndex < 0) {
    await registerFailure(input.organizationId, input.userId, row.failed_attempts || 0);
    return { ok: false as const, reason: 'MFA_CODE_INVALID' };
  }
  if (recoveryIndex >= 0) {
    const remaining = row.backup_codes_hash.filter((_, index) => index !== recoveryIndex);
    await sql()`update mfa_enrollments set backup_codes_hash = ${remaining}, failed_attempts = 0, locked_until = null, updated_at = now() where organization_id = ${input.organizationId} and user_id = ${input.userId}`;
  } else {
    await sql()`update mfa_enrollments set failed_attempts = 0, locked_until = null, updated_at = now() where organization_id = ${input.organizationId} and user_id = ${input.userId}`;
  }
  return { ok: true as const };
}

export async function createMfaAssurance(input: { organizationId: string; userId: string }) {
  const token = randomBytes(32).toString('base64url');
  const fingerprint = createHash('sha256').update(token).digest('hex');
  const id = `mfas_${randomBytes(12).toString('hex')}`;
  const expiresAt = new Date(Date.now() + ASSURANCE_HOURS * 60 * 60_000);
  await sql()`delete from mfa_assurance_sessions where organization_id = ${input.organizationId} and user_id = ${input.userId} and expires_at <= now()`;
  await sql()`insert into mfa_assurance_sessions (id, organization_id, user_id, session_fingerprint, verified_at, expires_at, created_at) values (${id}, ${input.organizationId}, ${input.userId}, ${fingerprint}, now(), ${expiresAt.toISOString()}, now())`;
  return { token, expiresAt };
}

export async function hasMfaAssurance(input: { organizationId: string; userId: string; token?: string | null }) {
  if (!input.token) return false;
  const fingerprint = createHash('sha256').update(input.token).digest('hex');
  const rows = await sql()`select id from mfa_assurance_sessions where organization_id = ${input.organizationId} and user_id = ${input.userId} and session_fingerprint = ${fingerprint} and expires_at > now() limit 1`;
  return Boolean(rows[0]);
}

export async function productionMfaReady(organizationId: string) {
  if (!mfaCryptoConfigured()) return false;
  const rows = await sql()`select count(*)::int as required_count, count(*) filter (where m.enabled = true and m.verified_at is not null)::int as enrolled_count
    from app_users u left join mfa_enrollments m on m.organization_id = u.organization_id and m.user_id = u.id
    where u.organization_id = ${organizationId} and u.status = 'active' and u.role in ('owner','admin')`;
  const row = rows[0] as { required_count?: number; enrolled_count?: number } | undefined;
  const required = Number(row?.required_count || 0);
  return required > 0 && Number(row?.enrolled_count || 0) === required;
}
