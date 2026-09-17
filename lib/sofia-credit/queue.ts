/**
 * Approval queue for the Sofia credit-repair concierge.
 *
 * enqueueDraft()   — append a draft as a JSON line to
 *                    data/sofia-credit-approval-queue.jsonl (dirs created).
 * listPending()    — read back all drafts still in pending_approval.
 * decideDraft()    — 'approved' | 'rejected' by a named owner; audit-logged.
 * markSent()       — ALWAYS throws. Sending is manual-only: a human (Juan)
 *                    dispatches approved drafts from the WhatsApp client.
 *
 * Phone numbers are masked to the last 4 digits in every log and decision
 * record. Full numbers are never written here.
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { DraftMessage } from "./concierge.ts";
import { assertDraftOnly } from "./guards.ts";

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(MODULE_DIR, "..", "..");
// Test isolation: SOFIA_CREDIT_DATA_DIR overrides the data directory.
// Read lazily so tests can set the env var after import.
function dataDir(): string {
  return process.env.SOFIA_CREDIT_DATA_DIR ?? join(REPO_ROOT, "data");
}
function queueFile(): string {
  return join(dataDir(), "sofia-credit-approval-queue.jsonl");
}
function decisionsFile(): string {
  return join(dataDir(), "sofia-credit-decisions.jsonl");
}

export interface DraftDecision {
  draftId: string;
  decision: "approved" | "rejected";
  by: string;
  at: string; // ISO
  toMasked: string; // last 4 digits only
  kind: string;
  caseId: string;
}

/** Mask a phone number to its last 4 digits for logs. */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `***${digits.slice(-4)}`;
}

function ensureDataDir(): void {
  if (!existsSync(dataDir())) mkdirSync(dataDir(), { recursive: true });
}

function readJsonLines(path: string): Record<string, unknown>[] {
  if (!existsSync(path)) return [];
  const content = readFileSync(path, "utf8");
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as Record<string, unknown>);
}

/** Append a draft to the approval queue. Returns the stored draft. */
export function enqueueDraft(draft: DraftMessage): DraftMessage {
  assertDraftOnly(draft);
  ensureDataDir();
  appendFileSync(queueFile(), JSON.stringify(draft) + "\n", "utf8");
  console.log(
    `[sofia-credit] draft queued: id=${draft.id} kind=${draft.kind} case=${draft.caseId} to=${maskPhone(draft.to)} status=${draft.status}`
  );
  return draft;
}

/** All drafts still awaiting owner approval. */
export function listPending(): DraftMessage[] {
  const rows = readJsonLines(queueFile());
  return rows.filter((r) => r.status === "pending_approval") as unknown as DraftMessage[];
}

/** All drafts ever queued (including decided ones). */
export function listAll(): DraftMessage[] {
  return readJsonLines(queueFile()) as unknown as DraftMessage[];
}

function rewriteQueue(rows: DraftMessage[]): void {
  ensureDataDir();
  writeFileSync(queueFile(), rows.map((r) => JSON.stringify(r)).join("\n") + (rows.length ? "\n" : ""), "utf8");
}

/**
 * Record an owner decision. Only 'approved' | 'rejected' are valid —
 * 'sent' (or anything else) throws. Audit-logged to console + JSONL.
 */
export function decideDraft(
  id: string,
  decision: "approved" | "rejected",
  by: string
): DraftDecision {
  if (decision !== "approved" && decision !== "rejected") {
    throw new Error(
      `Invalid decision "${decision}". Only "approved" or "rejected" are allowed; dispatch is manual-only.`
    );
  }
  const rows = listAll();
  const draft = rows.find((d) => d.id === id);
  if (!draft) throw new Error(`Draft not found: ${id}`);
  if (draft.status !== "pending_approval") {
    throw new Error(`Draft ${id} is already ${draft.status}; decisions apply to pending drafts only.`);
  }

  draft.status = decision === "approved" ? "approved" : "rejected";
  rewriteQueue(rows);

  const record: DraftDecision = {
    draftId: draft.id,
    decision,
    by,
    at: new Date().toISOString(),
    toMasked: maskPhone(draft.to),
    kind: draft.kind,
    caseId: draft.caseId,
  };
  ensureDataDir();
  appendFileSync(decisionsFile(), JSON.stringify(record) + "\n", "utf8");
  console.log(
    `[sofia-credit] draft decision: id=${draft.id} decision=${decision} by=${by} to=${record.toMasked} at=${record.at}`
  );
  return record;
}

/**
 * Dispatching a draft from code is never allowed. Approved drafts are sent
 * manually by the owner from the WhatsApp client. This function exists only
 * as a hard guard: it always throws.
 */
export function markSent(_draftId: string): never {
  throw new Error(
    "sending is manual-only: the concierge is draft-only; approved drafts are dispatched by the owner from WhatsApp."
  );
}

export function queuePaths(): { DATA_DIR: string; QUEUE_FILE: string; DECISIONS_FILE: string } {
  return { DATA_DIR: dataDir(), QUEUE_FILE: queueFile(), DECISIONS_FILE: decisionsFile() };
}
