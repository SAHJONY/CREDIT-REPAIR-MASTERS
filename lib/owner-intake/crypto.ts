/**
 * crypto.ts — AES-256-GCM field encryption for PII at rest (owner intake).
 *
 * Phone numbers are NEVER persisted in plaintext: createIntakeCase() stores
 * only the ciphertext produced here. The key comes from
 * OWNER_INTAKE_ENCRYPTION_KEY (64-char hex or base64, decoding to 32 bytes).
 *
 * - Production without the key → throws (fail closed).
 * - Non-production without the key → ephemeral in-memory key + loud warning.
 *   Data encrypted this way does NOT survive a restart; this is a dev
 *   convenience, never a deployment posture.
 */
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const KEY_ENV = "OWNER_INTAKE_ENCRYPTION_KEY";
let ephemeralKey: Buffer | null = null;

function isProduction(): boolean {
  return process.env.VERCEL_ENV === "production" || process.env.APP_ENV === "production";
}

/** Resolve the 32-byte encryption key, failing closed in production. */
export function getEncryptionKey(): Buffer {
  const raw = process.env[KEY_ENV]?.trim();
  if (raw) {
    const key = /^[0-9a-fA-F]{64}$/.test(raw) ? Buffer.from(raw, "hex") : Buffer.from(raw, "base64");
    if (key.length !== 32) {
      throw new Error("OWNER_INTAKE_KEY_INVALID: OWNER_INTAKE_ENCRYPTION_KEY must decode to 32 bytes.");
    }
    return key;
  }
  if (isProduction()) {
    throw new Error("OWNER_INTAKE_KEY_MISSING: set OWNER_INTAKE_ENCRYPTION_KEY in production.");
  }
  if (!ephemeralKey) {
    ephemeralKey = randomBytes(32);
    console.warn(
      "[owner-intake] WARNING: OWNER_INTAKE_ENCRYPTION_KEY is not set — using an ephemeral " +
        "in-memory key. Encrypted phone numbers will NOT survive a restart. Set the env var " +
        "for durable encrypted storage."
    );
  }
  return ephemeralKey;
}

/** Encrypt a PII field. Returns base64(iv || authTag || ciphertext). */
export function encryptField(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]).toString("base64");
}

/** Decrypt a payload produced by encryptField(). Throws on tampering. */
export function decryptField(payload: string): string {
  const key = getEncryptionKey();
  const buf = Buffer.from(payload, "base64");
  if (buf.length < 28) throw new Error("OWNER_INTAKE_DECRYPT_INVALID: payload too short.");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const ciphertext = buf.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}
