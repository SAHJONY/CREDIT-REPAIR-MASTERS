/**
 * index.ts — 24/7 autonomous ops cycles layer (New850 credit repair app).
 *
 * Orchestrates: bureau investigation-window tracking, dispute round
 * sequencing, dormant-case re-engagement, and the monitoring event feed.
 *
 * HARD CONTRACT: every action produces DRAFTS or internal events only.
 * Every external send stays approval-gated. Nothing in this layer performs
 * I/O or sends — queueing/sending belongs to other layers.
 */

export * from "./investigation-windows";
export * from "./round-sequencer";
export * from "./dormant-reengagement";
export * from "./event-feed";

import {
  refreshWindows,
  escalationNeeded,
  draftEscalation,
  type InvestigationWindow,
  type EscalationDraft
} from "./investigation-windows";
import {
  findDormant,
  draftNudge,
  type CaseActivity,
  type NudgeDraft
} from "./dormant-reengagement";
import { recordEvent, type CreditEvent } from "./event-feed";

export type DraftDescriptor = EscalationDraft | NudgeDraft;

export interface DailySweepInput {
  cases: CaseActivity[];
  windows: InvestigationWindow[];
  feed: CreditEvent[];
  nowISO: string;
}

export interface DailySweepResult {
  events: CreditEvent[];
  drafts: DraftDescriptor[];
}

/**
 * Run one daily 24/7 sweep:
 *   1. refresh windows → flag newly-overdue windows (events)
 *   2. draft CFPB escalation drafts for windows overdue > 7 days (events)
 *   3. find dormant cases (14d default) → draft warm nudges (events)
 *
 * Returns the appended feed (immutable copy) and all drafts.
 * Every draft carries status 'pending_approval'. Performs no I/O and no sends.
 */
export function runDailySweep(input: DailySweepInput): DailySweepResult {
  const { cases, nowISO } = input;
  const refreshed = refreshWindows(input.windows, nowISO);

  let feed = input.feed;
  const drafts: DraftDescriptor[] = [];

  // 1) Newly-overdue windows → flag events.
  for (const w of refreshed) {
    const wasOpen = input.windows.find((prev) => prev.id === w.id)?.status === "open";
    if (wasOpen && w.status === "overdue") {
      feed = recordEvent(feed, {
        ts: nowISO,
        caseId: w.caseId,
        kind: "overdue_flagged",
        detail: `${w.bureau} R${w.round} window overdue since ${w.dueAt}.`
      });
    }
  }

  // 2) Escalation drafts for windows overdue beyond the grace period.
  for (const w of refreshed) {
    if (escalationNeeded(w, nowISO)) {
      const draft = draftEscalation(w);
      drafts.push(draft);
      feed = recordEvent(feed, {
        ts: nowISO,
        caseId: w.caseId,
        kind: "escalation_drafted",
        detail: `CFPB complaint draft prepared for ${w.bureau} R${w.round} (pending approval).`
      });
    }
  }

  // 3) Dormant cases → nudge drafts.
  const dormant = findDormant(cases, nowISO);
  for (const c of dormant) {
    const draft = draftNudge(c);
    drafts.push(draft);
    feed = recordEvent(feed, {
      ts: nowISO,
      caseId: c.caseId,
      kind: "nudge_drafted",
      detail: `Re-engagement nudge drafted after ${c.daysIdle} idle days (pending approval).`
    });
  }

  return { events: feed, drafts };
}
