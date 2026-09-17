/**
 * intake.ts — owner-only credit-report case intake for New850.
 *
 * Storage: JSONL files under data/ (override with OWNER_INTAKE_DATA_DIR for
 * tests), mirroring the lib/sofia-credit/queue.ts pattern.
 *
 * Privacy posture (non-negotiable):
 * - Customer phone numbers are stored AES-256-GCM encrypted (see crypto.ts).
 *   The plaintext phone is NEVER written to disk.
 * - Every log line and audit record carries only the masked phone (last 4).
 * - SSNs are never extracted, stored, or logged. Filenames and free text are
 *   rejected when they look SSN-like (see guards.ts); the report file itself
 *   is stored opaquely in the private evidence vault and never parsed.
 * - Full phone reveal is a separate, audit-logged call (getIntakeCaseWithPhone).
 *
 * Draft-only posture: this module creates cases and records attachments. It
 * has no send path — disputes, letters, and customer messages stay
 * draft-only in the approval queue until the owner approves each item.
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { encryptField, decryptField } from "./crypto";
import { assertNoSsnLike, normalizePhone, validateIntakeFields } from "./guards";
import { maskPhone } from "../sofia-credit/queue";

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(MODULE_DIR, "..", "..");

function dataDir(): string {
  return process.env.OWNER_INTAKE_DATA_DIR ?? join(REPO_ROOT, "data");
}
function casesFile(): string {
  return join(dataDir(), "owner-intake-cases.jsonl");
}
function auditFile(): string {
  return join(dataDir(), "owner-intake-audit.jsonl");
}

export type IntakeCaseStatus =
  | "new"
  | "report_received"
  | "analyzing"
  | "ready_for_round1"
  | "in_dispute"
  | "done"
  | "closed";

export const INTAKE_STATUSES: IntakeCaseStatus[] = [
  "new",
  "report_received",
  "analyzing",
  "ready_for_round1",
  "in_dispute",
  "done",
  "closed"
];

export interface ReportAttachment {
  id: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  sha256: string;
  /** Private vault pathname — the file bytes live encrypted at rest in the vault. */
  vaultPath: string;
  attachedAt: string;
  attachedBy: string;
  ssnRedactionAttested: boolean;
}

export interface IntakeCase {
  id: string;
  organizationId: string;
  customerName: string;
  /** AES-256-GCM ciphertext (base64). Plaintext phone is never persisted. */
  phoneEnc: string;
  /** Last 4 digits — safe for lists, logs, and audit records. */
  phoneMasked: string;
  notes: string;
  status: IntakeCaseStatus;
  /** Dispute round once the case enters the dispute pipeline; null before. */
  disputeRound: 1 | 2 | 3 | "done" | null;
  windowStatus: "open" | "closed" | "overdue" | null;
  report: ReportAttachment | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

/** Public (list/detail) projection — never exposes the ciphertext. */
export interface PublicIntakeCase extends Omit<IntakeCase, "phoneEnc"> {}

export interface IntakeAuditEvent {
  id: string;
  organizationId: string;
  caseId: string;
  actorId: string;
  action: "case.created" | "report.attached" | "status.changed" | "pii.revealed";
  phoneMasked: string;
  detail: string;
  at: string;
}

function ensureDataDir(): void {
  if (!existsSync(dataDir())) mkdirSync(dataDir(), { recursive: true });
}

function readJsonLines(path: string): Record<string, unknown>[] {
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as Record<string, unknown>);
}

function rewriteCases(rows: IntakeCase[]): void {
  ensureDataDir();
  writeFileSync(casesFile(), rows.map((r) => JSON.stringify(r)).join("\n") + (rows.length ? "\n" : ""), "utf8");
}

function appendAudit(event: Omit<IntakeAuditEvent, "id" | "at">): IntakeAuditEvent {
  ensureDataDir();
  const record: IntakeAuditEvent = {
    ...event,
    id: `intake_audit_${randomUUID()}`,
    at: new Date().toISOString()
  };
  appendFileSync(auditFile(), JSON.stringify(record) + "\n", "utf8");
  return record;
}

export function toPublicCase(c: IntakeCase): PublicIntakeCase {
  const { phoneEnc: _dropped, ...rest } = c;
  return rest;
}

export interface CreateIntakeInput {
  organizationId: string;
  customerName: string;
  phone: string;
  notes?: string;
  createdBy: string;
}

/** Create a new intake case. Phone is encrypted before it ever touches disk. */
export function createIntakeCase(input: CreateIntakeInput): PublicIntakeCase {
  const orgId = (input.organizationId ?? "").trim();
  if (!orgId) throw new Error("INTAKE_ORG_REQUIRED: organizationId is required.");
  const actor = (input.createdBy ?? "").trim() || "owner";
  const { customerName, phoneDigits, notes } = validateIntakeFields({
    customerName: input.customerName,
    phone: input.phone,
    notes: input.notes
  });

  const now = new Date().toISOString();
  const record: IntakeCase = {
    id: `intake_${randomUUID()}`,
    organizationId: orgId,
    customerName,
    phoneEnc: encryptField(phoneDigits),
    phoneMasked: maskPhone(phoneDigits),
    notes,
    status: "new",
    disputeRound: null,
    windowStatus: null,
    report: null,
    createdAt: now,
    updatedAt: now,
    createdBy: actor
  };
  ensureDataDir();
  appendFileSync(casesFile(), JSON.stringify(record) + "\n", "utf8");
  appendAudit({
    organizationId: orgId,
    caseId: record.id,
    actorId: actor,
    action: "case.created",
    phoneMasked: record.phoneMasked,
    detail: `Intake case created for "${customerName}".`
  });
  console.log(
    `[owner-intake] case created: id=${record.id} org=${orgId} customer="${customerName}" ` +
      `phone=${record.phoneMasked} by=${actor}`
  );
  return toPublicCase(record);
}

export interface AttachReportInput {
  organizationId: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  sha256: string;
  vaultPath: string;
  attachedBy: string;
  /** Owner attests the SSN was redacted (or the customer consented to share it unredacted). */
  ssnRedactionAttested: boolean;
}

function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120) || "report";
}

/**
 * Record a credit-report attachment on a case. The file bytes were already
 * stored opaquely in the private vault by the caller; this records metadata
 * only — the report is never parsed, so no SSN can leak into the record.
 */
export function attachReport(caseId: string, input: AttachReportInput): PublicIntakeCase {
  if (!input.ssnRedactionAttested) {
    throw new Error(
      "INTAKE_SSN_ATTESTATION_REQUIRED: confirm the SSN was redacted (or consented) before attaching a report."
    );
  }
  assertNoSsnLike(input.fileName, "fileName");
  const orgId = (input.organizationId ?? "").trim();
  if (!orgId) throw new Error("INTAKE_ORG_REQUIRED: organizationId is required.");

  const rows = readJsonLines(casesFile()) as unknown as IntakeCase[];
  const record = rows.find((r) => r.id === caseId && r.organizationId === orgId);
  if (!record) throw new Error(`INTAKE_CASE_NOT_FOUND: no case ${caseId} in this organization.`);

  const now = new Date().toISOString();
  record.report = {
    id: `report_${randomUUID()}`,
    fileName: safeFileName(input.fileName),
    contentType: input.contentType,
    sizeBytes: input.sizeBytes,
    sha256: input.sha256,
    vaultPath: input.vaultPath,
    attachedAt: now,
    attachedBy: (input.attachedBy ?? "").trim() || "owner",
    ssnRedactionAttested: true
  };
  if (record.status === "new") record.status = "report_received";
  record.updatedAt = now;
  rewriteCases(rows);

  appendAudit({
    organizationId: orgId,
    caseId: record.id,
    actorId: record.report.attachedBy,
    action: "report.attached",
    phoneMasked: record.phoneMasked,
    detail: `Report attached: ${record.report.fileName} (${record.report.sizeBytes} bytes, sha256 ${record.report.sha256.slice(0, 12)}…).`
  });
  console.log(
    `[owner-intake] report attached: case=${record.id} file="${record.report.fileName}" ` +
      `sha256=${record.report.sha256.slice(0, 12)}… phone=${record.phoneMasked}`
  );
  return toPublicCase(record);
}

/** Fetch a case (public projection — no ciphertext, no plaintext phone). */
export function getIntakeCase(caseId: string, organizationId: string): PublicIntakeCase | null {
  const rows = readJsonLines(casesFile()) as unknown as IntakeCase[];
  const record = rows.find((r) => r.id === caseId && r.organizationId === organizationId);
  return record ? toPublicCase(record) : null;
}

/**
 * Reveal the full phone number for owner use (calling the customer).
 * Audit-logged with the masked phone; the only path that decrypts PII.
 */
export function getIntakeCaseWithPhone(
  caseId: string,
  organizationId: string,
  actorId: string
): (PublicIntakeCase & { phone: string }) | null {
  const rows = readJsonLines(casesFile()) as unknown as IntakeCase[];
  const record = rows.find((r) => r.id === caseId && r.organizationId === organizationId);
  if (!record) return null;
  const phone = decryptField(record.phoneEnc);
  // Sanity: decrypted value must be digits only — never log it.
  normalizePhone(phone);
  appendAudit({
    organizationId,
    caseId: record.id,
    actorId,
    action: "pii.revealed",
    phoneMasked: record.phoneMasked,
    detail: "Full phone number revealed to owner."
  });
  console.log(`[owner-intake] pii revealed: case=${record.id} phone=${record.phoneMasked} by=${actorId}`);
  return { ...toPublicCase(record), phone };
}

/** List cases for an org, newest first. Phones always masked. */
export function listIntakeCases(organizationId: string): PublicIntakeCase[] {
  const rows = readJsonLines(casesFile()) as unknown as IntakeCase[];
  return rows
    .filter((r) => r.organizationId === organizationId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .map(toPublicCase);
}

/** Advance the case workflow status. Dispute-round fields are managed via pipeline.ts. */
export function setCaseStatus(
  caseId: string,
  organizationId: string,
  status: IntakeCaseStatus,
  actorId: string
): PublicIntakeCase {
  if (!INTAKE_STATUSES.includes(status)) throw new Error(`INTAKE_STATUS_INVALID: "${status}".`);
  const rows = readJsonLines(casesFile()) as unknown as IntakeCase[];
  const record = rows.find((r) => r.id === caseId && r.organizationId === organizationId);
  if (!record) throw new Error(`INTAKE_CASE_NOT_FOUND: no case ${caseId} in this organization.`);
  const from = record.status;
  record.status = status;
  record.updatedAt = new Date().toISOString();
  rewriteCases(rows);
  appendAudit({
    organizationId,
    caseId: record.id,
    actorId,
    action: "status.changed",
    phoneMasked: record.phoneMasked,
    detail: `Status ${from} → ${status}.`
  });
  console.log(`[owner-intake] status changed: case=${record.id} ${from} → ${status} phone=${record.phoneMasked}`);
  return toPublicCase(record);
}

/** Internal helper for pipeline.ts — full records for the org. */
export function readIntakeRecords(organizationId: string): IntakeCase[] {
  return (readJsonLines(casesFile()) as unknown as IntakeCase[]).filter(
    (r) => r.organizationId === organizationId
  );
}

/** Persist pipeline-driven round/window updates (used by pipeline.ts). */
export function updatePipelineFields(
  caseId: string,
  organizationId: string,
  fields: { disputeRound?: IntakeCase["disputeRound"]; windowStatus?: IntakeCase["windowStatus"]; status?: IntakeCaseStatus }
): IntakeCase {
  const rows = readJsonLines(casesFile()) as unknown as IntakeCase[];
  const record = rows.find((r) => r.id === caseId && r.organizationId === organizationId);
  if (!record) throw new Error(`INTAKE_CASE_NOT_FOUND: no case ${caseId} in this organization.`);
  if (fields.disputeRound !== undefined) record.disputeRound = fields.disputeRound;
  if (fields.windowStatus !== undefined) record.windowStatus = fields.windowStatus;
  if (fields.status !== undefined) record.status = fields.status;
  record.updatedAt = new Date().toISOString();
  rewriteCases(rows);
  return record;
}

export function intakeAuditEvents(organizationId: string): IntakeAuditEvent[] {
  return (readJsonLines(auditFile()) as unknown as IntakeAuditEvent[]).filter(
    (e) => e.organizationId === organizationId
  );
}

export function intakePaths(): { DATA_DIR: string; CASES_FILE: string; AUDIT_FILE: string } {
  return { DATA_DIR: dataDir(), CASES_FILE: casesFile(), AUDIT_FILE: auditFile() };
}
