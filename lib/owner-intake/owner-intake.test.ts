import { before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Isolate test artifacts in /tmp so repo data/ is untouched.
before(() => {
  process.env.OWNER_INTAKE_DATA_DIR = mkdtempSync(join(tmpdir(), "owner-intake-test-"));
  process.env.OWNER_INTAKE_ENCRYPTION_KEY =
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
});

import {
  encryptField,
  decryptField,
  assertNoSsnLike,
  normalizePhone,
  createIntakeCase,
  attachReport,
  getIntakeCase,
  getIntakeCaseWithPhone,
  listIntakeCases,
  setCaseStatus,
  toPublicCase,
  readIntakeRecords,
  updatePipelineFields,
  intakeAuditEvents,
  intakeToActivity,
  intakeRoundInput,
  openDisputeWindow,
  describePipelineState,
  advanceIntakeRound,
} from "./index";
import { findDormant } from "../ops-cycles/dormant-reengagement";

const ORG = "org_test_intake";
const ACTOR = "owner-test";
const PHONE = "5551234567";

function captureLogs(fn: () => void): string[] {
  const lines: string[] = [];
  const original = console.log;
  console.log = (...args: unknown[]) => {
    lines.push(args.map(String).join(" "));
  };
  try {
    fn();
  } finally {
    console.log = original;
  }
  return lines;
}

describe("crypto", () => {
  it("encrypt/decrypt round-trips a phone number", () => {
    const enc = encryptField(PHONE);
    assert.notEqual(enc, PHONE);
    assert.equal(decryptField(enc), PHONE);
  });

  it("ciphertexts are non-deterministic (fresh IV each call)", () => {
    assert.notEqual(encryptField(PHONE), encryptField(PHONE));
  });

  it("tampered ciphertext fails authentication", () => {
    const enc = encryptField(PHONE);
    const buf = Buffer.from(enc, "base64");
    buf[buf.length - 1] ^= 0xff;
    assert.throws(() => decryptField(buf.toString("base64")));
  });
});

describe("guards", () => {
  it("rejects dashed SSN-like patterns in free text", () => {
    assert.throws(() => assertNoSsnLike("mi número es 123-45-6789", "notes"), /SSN_LIKE_PATTERN_REJECTED/);
  });

  it("rejects bare 9-digit runs", () => {
    assert.throws(() => assertNoSsnLike("id 123456789 fin", "notes"), /SSN_LIKE_PATTERN_REJECTED/);
  });

  it("rejects labeled SSN values", () => {
    assert.throws(() => assertNoSsnLike("SSN: 123456789", "notes"), /SSN_LIKE_PATTERN_REJECTED/);
  });

  it("accepts ordinary customer text", () => {
    assertNoSsnLike("María González", "customerName");
    assertNoSsnLike("Cliente referido por WhatsApp; llamar después de las 6pm.", "notes");
    assertNoSsnLike("reporte-equifax-2026.pdf", "fileName");
  });

  it("normalizePhone accepts 7–15 digit numbers and rejects the rest", () => {
    assert.equal(normalizePhone("+1 (555) 123-4567"), "15551234567");
    assert.throws(() => normalizePhone("123"), /INTAKE_PHONE_INVALID/);
    assert.throws(() => normalizePhone("1".repeat(16)), /INTAKE_PHONE_INVALID/);
  });
});

describe("intake", () => {
  it("creates a case with encrypted phone; raw file never holds the plaintext", () => {
    const created = createIntakeCase({
      organizationId: ORG,
      customerName: "María Prueba",
      phone: PHONE,
      notes: "Caso de prueba",
      createdBy: ACTOR
    });
    assert.equal(created.phoneMasked, "***4567");
    assert.ok(!("phoneEnc" in created), "public case must not expose the ciphertext");

    const raw = readFileSync(join(process.env.OWNER_INTAKE_DATA_DIR!, "owner-intake-cases.jsonl"), "utf8");
    assert.ok(!raw.includes(PHONE), "plaintext phone must never be written to disk");
    assert.ok(raw.includes("***4567"));

    // The stored ciphertext decrypts back to the digits.
    const records = readIntakeRecords(ORG);
    const stored = records.find((r) => r.id === created.id)!;
    assert.equal(decryptField(stored.phoneEnc), PHONE);
  });

  it("masks the phone in every log line", () => {
    const lines = captureLogs(() =>
      createIntakeCase({ organizationId: ORG, customerName: "Juan Log", phone: "5559876543", createdBy: ACTOR })
    );
    assert.ok(lines.length > 0);
    for (const line of lines) {
      assert.ok(!line.includes("5559876543"), `log leaked plaintext phone: ${line}`);
    }
    assert.ok(lines.some((l) => l.includes("***6543")));
  });

  it("validates name and phone", () => {
    assert.throws(
      () => createIntakeCase({ organizationId: ORG, customerName: "A", phone: PHONE, createdBy: ACTOR }),
      /INTAKE_NAME_INVALID/
    );
    assert.throws(
      () => createIntakeCase({ organizationId: ORG, customerName: "Ok Name", phone: "12", createdBy: ACTOR }),
      /INTAKE_PHONE_INVALID/
    );
    assert.throws(
      () =>
        createIntakeCase({
          organizationId: ORG,
          customerName: "Ok Name",
          phone: PHONE,
          notes: "ssn 123-45-6789 aquí",
          createdBy: ACTOR
        }),
      /SSN_LIKE_PATTERN_REJECTED/
    );
  });

  it("attaches a report only with SSN attestation; flips status to report_received", () => {
    const created = createIntakeCase({
      organizationId: ORG,
      customerName: "Con Reporte",
      phone: PHONE,
      createdBy: ACTOR
    });
    assert.throws(
      () =>
        attachReport(created.id, {
          organizationId: ORG,
          fileName: "reporte.pdf",
          contentType: "application/pdf",
          sizeBytes: 1234,
          sha256: "abc123",
          vaultPath: "vault/org/case/reporte.pdf",
          attachedBy: ACTOR,
          ssnRedactionAttested: false
        }),
      /INTAKE_SSN_ATTESTATION_REQUIRED/
    );
    const updated = attachReport(created.id, {
      organizationId: ORG,
      fileName: "reporte.pdf",
      contentType: "application/pdf",
      sizeBytes: 1234,
      sha256: "abc123",
      vaultPath: "vault/org/case/reporte.pdf",
      attachedBy: ACTOR,
      ssnRedactionAttested: true
    });
    assert.equal(updated.status, "report_received");
    assert.equal(updated.report?.fileName, "reporte.pdf");
    assert.equal(updated.report?.ssnRedactionAttested, true);

    const audit = intakeAuditEvents(ORG);
    const attached = audit.find((e) => e.action === "report.attached" && e.caseId === created.id);
    assert.ok(attached);
    assert.equal(attached.phoneMasked, "***4567");
  });

  it("rejects SSN-like filenames on attach", () => {
    const created = createIntakeCase({
      organizationId: ORG,
      customerName: "Nombre Archivo",
      phone: PHONE,
      createdBy: ACTOR
    });
    assert.throws(
      () =>
        attachReport(created.id, {
          organizationId: ORG,
          fileName: "ssn-123-45-6789.pdf",
          contentType: "application/pdf",
          sizeBytes: 10,
          sha256: "x",
          vaultPath: "v",
          attachedBy: ACTOR,
          ssnRedactionAttested: true
        }),
      /SSN_LIKE_PATTERN_REJECTED/
    );
  });

  it("getIntakeCase returns the public projection; reveal is audit-logged", () => {
    const created = createIntakeCase({
      organizationId: ORG,
      customerName: "Revelar",
      phone: PHONE,
      createdBy: ACTOR
    });
    const pub = getIntakeCase(created.id, ORG)!;
    assert.ok(!("phoneEnc" in pub));

    const revealed = getIntakeCaseWithPhone(created.id, ORG, ACTOR)!;
    assert.equal(revealed.phone, PHONE);
    const audit = intakeAuditEvents(ORG);
    const ev = audit.find((e) => e.action === "pii.revealed" && e.caseId === created.id);
    assert.ok(ev, "PII reveal must be audit-logged");
    assert.equal(ev.phoneMasked, "***4567");
    assert.equal(ev.actorId, ACTOR);
  });

  it("setCaseStatus moves workflow status and rejects unknown statuses", () => {
    const created = createIntakeCase({
      organizationId: ORG,
      customerName: "Estados",
      phone: PHONE,
      createdBy: ACTOR
    });
    const moved = setCaseStatus(created.id, ORG, "analyzing", ACTOR);
    assert.equal(moved.status, "analyzing");
    assert.throws(
      () => setCaseStatus(created.id, ORG, "bogus" as never, ACTOR),
      /INTAKE_STATUS_INVALID/
    );
  });

  it("listIntakeCases is org-scoped and newest-first", () => {
    const a = createIntakeCase({ organizationId: ORG, customerName: "Lista A", phone: PHONE, createdBy: ACTOR });
    createIntakeCase({ organizationId: "org_other", customerName: "Otro", phone: PHONE, createdBy: ACTOR });
    const list = listIntakeCases(ORG);
    assert.ok(list.every((c) => c.id !== undefined));
    assert.ok(!list.some((c) => c.customerName === "Otro"), "other org's cases must not leak");
    assert.ok(list[0].createdAt >= a.createdAt, "newest first");
  });
});

describe("pipeline wiring", () => {
  it("intakeToActivity feeds the dormant-nudge detector", () => {
    const created = createIntakeCase({
      organizationId: ORG,
      customerName: "Dormido",
      phone: PHONE,
      createdBy: ACTOR
    });
    const records = readIntakeRecords(ORG);
    const activity = intakeToActivity(records);
    const entry = activity.find((a) => a.caseId === created.id)!;
    assert.equal(entry.lastEventAt, created.updatedAt);

    const dormant = findDormant(
      [{ caseId: created.id, lastEventAt: "2026-01-01T00:00:00.000Z" }],
      "2026-09-17T00:00:00.000Z"
    );
    assert.equal(dormant.length, 1);
    assert.equal(dormant[0].caseId, created.id);
  });

  it("intakeRoundInput is null until the case is in dispute", () => {
    const created = createIntakeCase({
      organizationId: ORG,
      customerName: "Sin Disputa",
      phone: PHONE,
      createdBy: ACTOR
    });
    assert.equal(intakeRoundInput(created), null);
    assert.match(describePipelineState(created, "es"), /Nuevo/);
  });

  it("openDisputeWindow uses 30 days standard, 45 for free annual reports", () => {
    const w30 = openDisputeWindow("case_x", "equifax", 1, "2026-09-17T00:00:00.000Z");
    const w45 = openDisputeWindow("case_x", "equifax", 1, "2026-09-17T00:00:00.000Z", true);
    const days = (w: typeof w30) =>
      Math.round((new Date(w.dueAt).getTime() - new Date(w.openedAt).getTime()) / 86_400_000);
    assert.equal(days(w30), 30);
    assert.equal(days(w45), 45);
    assert.equal(w30.status, "open");
  });

  it("advanceIntakeRound follows the R1→R2→R3 sequencer and persists", () => {
    const created = createIntakeCase({
      organizationId: ORG,
      customerName: "Secuencia",
      phone: PHONE,
      createdBy: ACTOR
    });
    const idle = advanceIntakeRound(readIntakeRecords(ORG).find((r) => r.id === created.id)!, ORG);
    assert.equal(idle.action, "not_in_dispute");

    updatePipelineFields(created.id, ORG, { disputeRound: 1, windowStatus: "closed", status: "in_dispute" });
    const rec = readIntakeRecords(ORG).find((r) => r.id === created.id)!;
    assert.match(describePipelineState(toPublicCase(rec), "es"), /avanzar a la ronda 2/);

    const advanced = advanceIntakeRound(rec, ORG);
    assert.equal(advanced.action, "advance");
    assert.equal(advanced.disputeRound, 2);
    assert.equal(advanced.windowStatus, "open");

    // R3 closed → done.
    updatePipelineFields(created.id, ORG, { disputeRound: 3, windowStatus: "closed", status: "in_dispute" });
    const rec3 = readIntakeRecords(ORG).find((r) => r.id === created.id)!;
    const done = advanceIntakeRound(rec3, ORG);
    assert.equal(done.action, "done");
    assert.equal(done.disputeRound, "done");
    assert.equal(done.status, "done");
  });
});

describe("draft-only posture", () => {
  it("the module exposes no send/dispatch path", async () => {
    const mod = (await import("./index.ts")) as unknown as Record<string, unknown>;
    const suspicious = Object.keys(mod).filter((k) => /^(send|markSent|dispatch|transmit)/i.test(k));
    assert.deepEqual(suspicious, []);
  });
});
