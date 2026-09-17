/**
 * guards.ts — SSN hygiene for the owner intake.
 *
 * The intake NEVER extracts or stores Social Security numbers as data:
 * the credit report file is stored opaquely in the private evidence vault
 * and is never parsed. As a second layer, free-text fields (name, notes)
 * and filenames are rejected when they look like they contain an SSN, and
 * attaching a report requires the owner's attestation that the SSN was
 * redacted (or that the customer consented to share the unredacted report).
 *
 * This module is deliberately conservative: a false rejection just asks the
 * owner to re-check the field; a false acceptance could persist an SSN.
 */

const SSN_DASHED = /\b\d{3}[- ]\d{2}[- ]\d{4}\b/;
const SSN_BARE = /\b\d{9}\b/;
const SSN_LABELED = /\b(ssn|seguro social|social security)\b\s*[:#-]?\s*\d/i;

/** Throw if `value` looks like it contains a Social Security number. */
export function assertNoSsnLike(value: string, field: string): void {
  if (!value) return;
  if (SSN_DASHED.test(value) || SSN_BARE.test(value) || SSN_LABELED.test(value)) {
    throw new Error(
      `SSN_LIKE_PATTERN_REJECTED: the "${field}" field appears to contain a Social Security ` +
        `number. Redact it before submitting — SSNs are never stored by the intake.`
    );
  }
}

/** Validate an intake phone number; returns normalized digits. */
export function normalizePhone(phone: string): string {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) {
    throw new Error("INTAKE_PHONE_INVALID: phone must contain 7–15 digits.");
  }
  return digits;
}

/** Validate the owner-facing case fields. */
export function validateIntakeFields(input: { customerName: string; phone: string; notes?: string }): {
  customerName: string;
  phoneDigits: string;
  notes: string;
} {
  const customerName = (input.customerName ?? "").trim();
  if (customerName.length < 2 || customerName.length > 120) {
    throw new Error("INTAKE_NAME_INVALID: customer name must be 2–120 characters.");
  }
  const notes = (input.notes ?? "").trim();
  if (notes.length > 2000) {
    throw new Error("INTAKE_NOTES_TOO_LONG: notes are limited to 2000 characters.");
  }
  assertNoSsnLike(customerName, "customerName");
  assertNoSsnLike(notes, "notes");
  const phoneDigits = normalizePhone(input.phone);
  return { customerName, phoneDigits, notes };
}
