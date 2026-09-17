/**
 * ops-cycles.test.ts — node:test coverage for the 24/7 autonomous ops cycles layer.
 *
 * Contract under test:
 *  - pure logic, no I/O, no sends
 *  - every draft status === 'pending_approval'
 *  - no score promises, no invented bureau responses
 *
 * Run: node --test lib/ops-cycles/*.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  openWindow,
  refreshWindows,
  escalationNeeded,
  draftEscalation,
  nextRound,
  escalationLevel,
  describePlan,
  findDormant,
  draftNudge,
  recordEvent,
  getFeed,
  runDailySweep,
  type InvestigationWindow,
  type CreditEvent
} from "./index.ts";

// ---------- investigation-windows ----------

describe("investigation window due math", () => {
  it("sets dueAt = openedAt + 30 days for a standard dispute", () => {
    const w = openWindow({
      caseId: "case_1",
      bureau: "equifax",
      round: 1,
      openedAt: "2026-01-01T00:00:00.000Z"
    });
    assert.equal(w.dueAt, "2026-01-31T00:00:00.000Z");
    assert.equal(w.status, "open");
    assert.ok(w.id.startsWith("win_"));
  });

  it("sets dueAt = openedAt + 45 days when the dispute stems from the free annual report", () => {
    const w = openWindow({
      caseId: "case_1",
      bureau: "experian",
      round: 1,
      openedAt: "2026-01-01T00:00:00.000Z",
      freeAnnualReport: true
    });
    assert.equal(w.dueAt, "2026-02-15T00:00:00.000Z");
  });
});

describe("refreshWindows", () => {
  const mk = (status: InvestigationWindow["status"]): InvestigationWindow => ({
    id: "win_test_1",
    caseId: "case_1",
    bureau: "transunion",
    round: 1,
    openedAt: "2026-01-01T00:00:00.000Z",
    dueAt: "2026-01-31T00:00:00.000Z",
    status
  });

  it("marks an overdue open window as overdue", () => {
    const out = refreshWindows([mk("open")], "2026-02-01T00:00:00.000Z");
    assert.equal(out[0].status, "overdue");
  });

  it("keeps a not-yet-due window open", () => {
    const out = refreshWindows([mk("open")], "2026-01-15T00:00:00.000Z");
    assert.equal(out[0].status, "open");
  });

  it("does not mutate the input array", () => {
    const w = mk("open");
    refreshWindows([w], "2026-02-01T00:00:00.000Z");
    assert.equal(w.status, "open");
  });
});

describe("escalationNeeded", () => {
  const overdue = (dueAt: string): InvestigationWindow => ({
    id: "win_esc",
    caseId: "case_1",
    bureau: "equifax",
    round: 2,
    openedAt: "2026-01-01T00:00:00.000Z",
    dueAt,
    status: "overdue"
  });

  it("is true when overdue by more than 7 days", () => {
    const w = overdue("2026-01-31T00:00:00.000Z");
    assert.equal(escalationNeeded(w, "2026-02-10T00:00:00.000Z"), true);
  });

  it("is false at exactly 7 days overdue (strict boundary)", () => {
    const w = overdue("2026-01-31T00:00:00.000Z");
    assert.equal(escalationNeeded(w, "2026-02-07T00:00:00.000Z"), false);
  });

  it("is false for a non-overdue window", () => {
    const w = { ...overdue("2026-01-31T00:00:00.000Z"), status: "open" as const };
    assert.equal(escalationNeeded(w, "2026-02-20T00:00:00.000Z"), false);
  });

  it("draftEscalation produces a pending_approval CFPB draft citing FCRA", () => {
    const draft = draftEscalation(overdue("2026-01-31T00:00:00.000Z"));
    assert.equal(draft.type, "cfpb_complaint_draft");
    assert.equal(draft.status, "pending_approval");
    assert.ok(draft.body.includes("FCRA"));
    assert.ok(draft.body.includes("approval"));
  });
});

// ---------- round-sequencer ----------

describe("nextRound", () => {
  it("waits when the window is open", () => {
    assert.equal(nextRound({ round: 1, windowStatus: "open" }).action, "wait");
  });

  it("waits when the window is overdue (escalation track, not advancement)", () => {
    assert.equal(nextRound({ round: 1, windowStatus: "overdue" }).action, "wait");
  });

  it("sequences R1 -> R2 -> R3 -> done", () => {
    const r1 = nextRound({ round: 1, windowStatus: "closed" });
    assert.equal(r1.action, "advance");
    assert.equal(r1.nextRound, 2);
    const r2 = nextRound({ round: 2, windowStatus: "closed" });
    assert.equal(r2.action, "advance");
    assert.equal(r2.nextRound, 3);
    const r3 = nextRound({ round: 3, windowStatus: "closed" });
    assert.equal(r3.action, "done");
    assert.equal(nextRound({ round: "done", windowStatus: "closed" }).action, "done");
  });

  it("cannot advance round 1 with its window still open", () => {
    const d = nextRound({ round: 1, windowStatus: "open" });
    assert.equal(d.action, "wait");
    assert.equal(d.nextRound, undefined);
  });

  it("escalationLevel labels are correct", () => {
    assert.equal(escalationLevel(1), "Verificación factual (FCRA §611)");
    assert.equal(escalationLevel(2), "Método de verificación");
    assert.equal(escalationLevel(3), "Mención CFPB");
  });

  it("describePlan produces a Spanish plan summary covering all rounds", () => {
    const plan = describePlan("case_9", "experian");
    assert.ok(plan.includes("case_9"));
    assert.ok(plan.includes("Experian"));
    assert.ok(plan.includes("Ronda 1"));
    assert.ok(plan.includes("Ronda 2"));
    assert.ok(plan.includes("Ronda 3"));
    assert.ok(plan.includes("tu aprobación"));
    assert.ok(plan.includes("Sin promesas de puntaje"));
  });
});

// ---------- dormant-reengagement ----------

describe("findDormant and draftNudge", () => {
  const now = "2026-09-17T00:00:00.000Z";

  it("flags cases idle beyond the default 14-day threshold", () => {
    const out = findDormant(
      [
        { caseId: "idle_20", lastEventAt: "2026-08-28T00:00:00.000Z" },
        { caseId: "fresh_5", lastEventAt: "2026-09-12T00:00:00.000Z" }
      ],
      now
    );
    assert.deepEqual(
      out.map((c) => c.caseId),
      ["idle_20"]
    );
    assert.equal(out[0].daysIdle, 20);
  });

  it("treats exactly 14 days as not dormant (strict threshold)", () => {
    const out = findDormant([{ caseId: "edge", lastEventAt: "2026-09-03T00:00:00.000Z" }], now);
    assert.deepEqual(out, []);
  });

  it("honors a custom threshold", () => {
    assert.deepEqual(findDormant([{ caseId: "edge", lastEventAt: "2026-09-03T00:00:00.000Z" }], now, 30), []);
    assert.equal(findDormant([{ caseId: "edge", lastEventAt: "2026-09-03T00:00:00.000Z" }], now, 10).length, 1);
  });

  it("draftNudge is pending_approval, Spanish, and makes no promises", () => {
    const draft = draftNudge({ caseId: "idle_20", lastEventAt: "2026-08-28T00:00:00.000Z", daysIdle: 20 });
    assert.equal(draft.type, "dormant_nudge_draft");
    assert.equal(draft.status, "pending_approval");
    assert.equal(draft.caseId, "idle_20");
    assert.ok(draft.body.includes("Hola"));
    // banned words — score promises, outcome guarantees, timelines
    const banned = [
      "garantiz",
      "promet",
      "puntos",
      "aumentará",
      "mejorará tu puntaje",
      "subirá",
      "te garantizo",
      "seguro",
      "100%"
    ];
    const lower = draft.body.toLowerCase();
    for (const word of banned) {
      assert.ok(!lower.includes(word), `nudge body must not contain "${word}"`);
    }
  });
});

// ---------- event-feed ----------

describe("event feed", () => {
  it("recordEvent appends immutably with evt_ ids", () => {
    const feed: CreditEvent[] = [];
    const next = recordEvent(feed, { caseId: "case_1", kind: "window_opened", detail: "R1 opened" });
    assert.equal(feed.length, 0);
    assert.equal(next.length, 1);
    assert.ok(next[0].id.startsWith("evt_"));
    assert.equal(next[0].kind, "window_opened");
  });

  it("getFeed filters by caseId", () => {
    let feed: CreditEvent[] = [];
    feed = recordEvent(feed, { caseId: "a", kind: "window_opened", detail: "x" });
    feed = recordEvent(feed, { caseId: "b", kind: "window_opened", detail: "y" });
    assert.equal(getFeed(feed, "a").length, 1);
    assert.equal(getFeed(feed).length, 2);
  });
});

// ---------- runDailySweep ----------

describe("runDailySweep", () => {
  it("fixture with 1 overdue-10d window + 1 dormant case: escalation draft + nudge draft, all pending_approval, feed gains events", () => {
    const window: InvestigationWindow = {
      id: "win_sweep",
      caseId: "overdue_case",
      bureau: "equifax",
      round: 2,
      openedAt: "2026-08-01T00:00:00.000Z",
      dueAt: "2026-08-31T00:00:00.000Z", // 10 days overdue on 2026-09-10
      status: "open"
    };
    const cases = [
      { caseId: "dormant_case", lastEventAt: "2026-08-01T00:00:00.000Z" },
      { caseId: "active_case", lastEventAt: "2026-09-08T00:00:00.000Z" }
    ];
    const now = "2026-09-10T00:00:00.000Z";
    const inputFeed: CreditEvent[] = [];

    const result = runDailySweep({ cases, windows: [window], feed: inputFeed, nowISO: now });

    // escalation draft + nudge draft
    assert.equal(result.drafts.length, 2);
    for (const d of result.drafts) {
      assert.equal(d.status, "pending_approval");
      assert.notEqual(d.status, "sent");
    }
    assert.ok(result.drafts.some((d) => d.type === "cfpb_complaint_draft"));
    assert.ok(result.drafts.some((d) => d.type === "dormant_nudge_draft"));

    // feed gained events: overdue_flagged, escalation_drafted, nudge_drafted
    const kinds = result.events.map((e) => e.kind);
    assert.ok(kinds.includes("overdue_flagged"));
    assert.ok(kinds.includes("escalation_drafted"));
    assert.ok(kinds.includes("nudge_drafted"));
    assert.equal(result.events.length, 3);

    // input feed untouched (immutability)
    assert.deepEqual(inputFeed, []);
  });

  it("sweep is a no-op on healthy state", () => {
    const window: InvestigationWindow = {
      id: "win_ok",
      caseId: "fresh_case",
      bureau: "experian",
      round: 1,
      openedAt: "2026-09-01T00:00:00.000Z",
      dueAt: "2026-10-01T00:00:00.000Z",
      status: "open"
    };
    const result = runDailySweep({
      cases: [{ caseId: "fresh_case", lastEventAt: "2026-09-16T00:00:00.000Z" }],
      windows: [window],
      feed: [],
      nowISO: "2026-09-17T00:00:00.000Z"
    });
    assert.deepEqual(result.drafts, []);
    assert.deepEqual(result.events, []);
  });
});
