/**
 * event-feed.ts
 *
 * Immutable monitoring event feed — the client-visible record the 24/7 ops
 * layer produces. Appends never mutate: recordEvent returns a NEW array.
 */

export type CreditEventKind =
  | "window_opened"
  | "response_received"
  | "overdue_flagged"
  | "round_advanced"
  | "letter_approved"
  | "nudge_drafted"
  | "escalation_drafted";

export interface CreditEvent {
  id: string;
  ts: string; // ISO 8601
  caseId: string;
  kind: CreditEventKind;
  detail: string;
}

let eventCounter = 0;

/**
 * Append an event immutably — returns a new feed array, input untouched.
 */
export function recordEvent(feed: CreditEvent[], e: { caseId: string; kind: CreditEventKind; detail: string; ts?: string }): CreditEvent[] {
  eventCounter += 1;
  const event: CreditEvent = {
    id: `evt_${Date.now().toString(36)}_${String(eventCounter).padStart(4, "0")}`,
    ts: e.ts ?? new Date().toISOString(),
    caseId: e.caseId,
    kind: e.kind,
    detail: e.detail
  };
  return [...feed, event];
}

/**
 * Filter the feed by caseId (all events when omitted).
 */
export function getFeed(feed: CreditEvent[], caseId?: string): CreditEvent[] {
  if (!caseId) return [...feed];
  return feed.filter((e) => e.caseId === caseId);
}
