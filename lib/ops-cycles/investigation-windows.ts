/**
 * investigation-windows.ts
 *
 * 24/7 autonomous ops: FCRA §611 bureau investigation window tracking.
 *
 * A bureau must complete its reinvestigation within 30 days of receiving the
 * dispute notice (45 days when the dispute stems from the free annual report).
 * These functions are pure logic — no I/O, no external sends.
 */

export type Bureau = "equifax" | "experian" | "transunion";
export type DisputeRound = 1 | 2 | 3;
export type WindowStatus = "open" | "closed" | "overdue";

export interface InvestigationWindow {
  id: string;
  caseId: string;
  bureau: Bureau;
  round: DisputeRound;
  openedAt: string; // ISO 8601
  dueAt: string; // ISO 8601
  status: WindowStatus;
}

export interface OpenWindowInput {
  caseId: string;
  bureau: Bureau;
  round: DisputeRound;
  openedAt: string; // ISO 8601
  freeAnnualReport?: boolean;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const WINDOW_DAYS_STANDARD = 30;
export const WINDOW_DAYS_FREE_ANNUAL_REPORT = 45;
export const ESCALATION_GRACE_DAYS = 7;

let windowCounter = 0;

function addDays(iso: string, days: number): string {
  return new Date(new Date(iso).getTime() + days * MS_PER_DAY).toISOString();
}

/**
 * Open an investigation window. dueAt = openedAt + 30 days (FCRA §611),
 * or + 45 days when the dispute arose from the free annual report.
 */
export function openWindow(input: OpenWindowInput): InvestigationWindow {
  const days = input.freeAnnualReport ? WINDOW_DAYS_FREE_ANNUAL_REPORT : WINDOW_DAYS_STANDARD;
  windowCounter += 1;
  return {
    id: `win_${Date.now().toString(36)}_${String(windowCounter).padStart(4, "0")}`,
    caseId: input.caseId,
    bureau: input.bureau,
    round: input.round,
    openedAt: input.openedAt,
    dueAt: addDays(input.openedAt, days),
    status: "open"
  };
}

/**
 * Purely functional: returns a new array with 'open' windows whose dueAt has
 * passed marked 'overdue'. Records nothing externally.
 */
export function refreshWindows(windows: InvestigationWindow[], nowISO: string): InvestigationWindow[] {
  const nowMs = new Date(nowISO).getTime();
  return windows.map((w) => {
    if (w.status === "open" && new Date(w.dueAt).getTime() < nowMs) {
      return { ...w, status: "overdue" as const };
    }
    return w;
  });
}

/**
 * Escalation is warranted only when the window is overdue by MORE than 7 days.
 * Exactly 7 days → false (boundary is strict).
 */
export function escalationNeeded(window: InvestigationWindow, nowISO: string): boolean {
  if (window.status !== "overdue") return false;
  const overdueMs = new Date(nowISO).getTime() - new Date(window.dueAt).getTime();
  return overdueMs > ESCALATION_GRACE_DAYS * MS_PER_DAY;
}

export interface EscalationDraft {
  type: "cfpb_complaint_draft";
  caseId: string;
  bureau: Bureau;
  round: DisputeRound;
  status: "pending_approval";
  body: string;
}

/**
 * Produce a CFPB complaint DRAFT (factual, cites FCRA §611 non-response).
 * Never filed by this function — always requires human approval.
 */
export function draftEscalation(window: InvestigationWindow): EscalationDraft {
  const opened = new Date(window.openedAt).toISOString().slice(0, 10);
  const due = new Date(window.dueAt).toISOString().slice(0, 10);
  const body = [
    `DRAFT — Consumer Financial Protection Bureau (CFPB) complaint narrative.`,
    `DO NOT FILE AUTOMATICALLY — requires client/operator approval.`,
    ``,
    `Case: ${window.caseId} | Bureau: ${window.bureau} | Dispute round: R${window.round}`,
    `Dispute notice received by bureau (recorded): ${opened}`,
    `Investigation deadline (FCRA 15 U.S.C. § 1681i, 30-day reinvestigation window): ${due}`,
    ``,
    `Narrative: The credit reporting agency listed above received a notice of dispute`,
    `for this case on or about ${opened}. Under FCRA §611, the agency was required to`,
    `complete its reinvestigation within 30 days of receiving the notice (45 days where`,
    `applicable to free-annual-report disputes). As of this writing, that window has`,
    `elapsed with no reinvestigation result received.`,
    ``,
    `Requested relief: reinvestigation of the disputed item(s) and correction or`,
    `deletion of any information the bureau cannot verify.`,
    ``,
    `NOTE: This is an internal draft. Filing requires explicit client approval.`
  ].join("\n");
  return {
    type: "cfpb_complaint_draft",
    caseId: window.caseId,
    bureau: window.bureau,
    round: window.round,
    status: "pending_approval",
    body
  };
}
