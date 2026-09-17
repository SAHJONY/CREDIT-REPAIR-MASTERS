import { before, describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Isolate test artifacts in /tmp so repo data/ is untouched.
before(() => {
  process.env.SOFIA_CREDIT_DATA_DIR = mkdtempSync(join(tmpdir(), "sofia-credit-test-"));
});

import {
  statusUpdate,
  documentRequest,
  followUp,
  roundNotification,
  windowExpiry,
  dormantNudge,
  caseClosed,
  classifyWithPolicy,
  type DraftKind,
  type DraftMessage,
} from "./concierge";
import { enqueueDraft, listPending, decideDraft, markSent, maskPhone } from "./queue";
import { assertDraftOnly, checkConciergeAuthority } from "./guards";

const FAKE_TO = "+15551234567";
const CASE = { to: FAKE_TO, caseId: "case_test_001", clientName: "María Prueba" };

const BUILDERS: Array<[DraftKind, (o?: Record<string, unknown>) => DraftMessage]> = [
  ["status_update", (o = {}) => statusUpdate({ ...CASE, ...o, statusLine: "avance en tu caso" })],
  ["document_request", (o = {}) => documentRequest({ ...CASE, ...o, missingDocs: ["ID", "prueba de domicilio"] })],
  ["follow_up", (o = {}) => followUp({ ...CASE, ...o, nextStep: "sube tu reporte de crédito" })],
  ["round_notification", (o = {}) => roundNotification({ ...CASE, ...o, round: 1, bureau: "Equifax" })],
  ["window_expiry", (o = {}) => windowExpiry({ ...CASE, ...o, daysOverdue: 35 })],
  ["dormant_nudge", (o = {}) => dormantNudge({ ...CASE, ...o, daysIdle: 60 })],
  ["case_closed", (o = {}) => caseClosed({ ...CASE, ...o })],
];

const BANNED: RegExp[] = [/garantiz/i, /\+ ?\d{2,3} ?puntos/i, /borramos todo/i, /100%/];

describe("draft builders", () => {
  for (const [kind, build] of BUILDERS) {
    it(`${kind}: pending_approval, approval_required, whatsapp, spanish, <=400 chars`, () => {
      const draft = build();
      assert.equal(draft.kind, kind);
      assert.equal(draft.status, "pending_approval");
      assert.equal(draft.authority, "approval_required");
      assert.equal(draft.channel, "whatsapp");
      assert.equal(draft.language, "es");
      assert.ok(draft.id.startsWith("draft_wa_"));
      assert.equal(draft.createdBy, "sofia-credit-concierge");
      assert.ok(!Number.isNaN(Date.parse(draft.createdAt)));
      assert.ok(draft.body.length <= 400, `body too long: ${draft.body.length}`);
      assert.ok(draft.body.toLowerCase().includes("responde a este mensaje si tienes preguntas"));
      for (const banned of BANNED) {
        assert.ok(!banned.test(draft.body), `${kind} body matched banned pattern ${banned}`);
      }
      assertDraftOnly(draft); // must not throw
    });

    it(`${kind}: English body when language='en'`, () => {
      const draft = build({ language: "en" });
      assert.equal(draft.language, "en");
      assert.ok(draft.body.toLowerCase().includes("reply to this message if you have questions"));
    });
  }

  it("bodies differ across kinds", () => {
    const bodies = new Set(BUILDERS.map(([, build]) => build().body));
    assert.equal(bodies.size, BUILDERS.length);
  });
});

describe("queue", () => {
  it("enqueueDraft + listPending round-trips drafts, masks phone in logs", () => {
    const calls: string[] = [];
    const logMock = mock.method(console, "log", (...args: unknown[]) => {
      calls.push(args.map(String).join(" "));
    });
    try {
      const draft = statusUpdate({ ...CASE, statusLine: "prueba" });
      enqueueDraft(draft);
      const pending = listPending();
      assert.ok(pending.some((d) => d.id === draft.id));
      const logged = calls.join("\n");
      assert.ok(!logged.includes(FAKE_TO), "full phone number leaked into logs");
      assert.ok(logged.includes(maskPhone(FAKE_TO)));
    } finally {
      logMock.mock.restore();
    }
  });

  it("maskPhone keeps only the last 4 digits", () => {
    assert.equal(maskPhone("+15551234567"), "***4567");
    assert.equal(maskPhone("+1 281 662 8581"), "***8581");
  });

  it("decideDraft('sent') throws; invalid decisions are rejected", () => {
    const draft = followUp({ ...CASE, nextStep: "prueba" });
    enqueueDraft(draft);
    assert.throws(() => decideDraft(draft.id, "sent" as "approved", "Juan"));
    assert.throws(() => decideDraft(draft.id, "maybe" as "approved", "Juan"));
    const rec = decideDraft(draft.id, "approved", "Juan");
    assert.equal(rec.decision, "approved");
    assert.equal(rec.toMasked, "***4567");
    assert.ok(!listPending().some((d) => d.id === draft.id));
    assert.throws(() => decideDraft(draft.id, "rejected", "Juan")); // already decided
  });

  it("markSent always throws", () => {
    const draft = dormantNudge({ ...CASE, daysIdle: 10 });
    enqueueDraft(draft);
    assert.throws(() => markSent(draft.id), /manual-only/);
  });
});

describe("policy classification", () => {
  for (const [kind] of BUILDERS) {
    it(`${kind}: classifyWithPolicy never returns plain 'allowed'`, () => {
      const plain = classifyWithPolicy(kind);
      assert.equal(plain.allowed, false); // blocked without consent
      const withConsent = classifyWithPolicy(kind, { consentId: "consent_owner_1" });
      assert.equal(withConsent.allowed, true);
      assert.equal(withConsent.approval, true); // approval_required, never plain allowed
    });
  }
});

describe("guards", () => {
  it("assertDraftOnly throws for non-pending drafts", () => {
    const draft = statusUpdate({ ...CASE, statusLine: "x" });
    assertDraftOnly(draft);
    assert.throws(() => assertDraftOnly({ ...draft, status: "approved" }));
    assert.throws(() => assertDraftOnly({ ...draft, authority: "autonomous" as unknown as DraftMessage["authority"] }));
  });

  it("checkConciergeAuthority: concierge absent from registry, never autonomous", () => {
    const check = checkConciergeAuthority();
    assert.equal(check.conciergeAuthority, "approval_required");
    assert.equal(check.registryLookup, undefined);
    assert.equal(check.complianceGuardian, "compliance");
  });
});

describe("routing config", () => {
  it("parses and contains the credit_repair entry with isolation 'business'", () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const raw = readFileSync(join(here, "..", "..", "config", "sofia-business-routing.json"), "utf8");
    const config = JSON.parse(raw) as {
      routing_registry: Array<{ id: string; name: string; isolation: string }>;
      governance: { binding_actions_require_owner_approval: boolean };
    };
    const entry = config.routing_registry.find((e) => e.id === "credit_repair");
    assert.ok(entry, "credit_repair entry missing");
    assert.equal(entry!.name, "New850 Credit Repair");
    assert.equal(entry!.isolation, "business");
    // Existing entries untouched
    assert.ok(config.routing_registry.some((e) => e.id === "global_trade"));
    assert.equal(config.governance.binding_actions_require_owner_approval, true);
  });
});
