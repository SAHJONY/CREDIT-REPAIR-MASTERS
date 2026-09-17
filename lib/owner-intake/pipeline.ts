/**
 * pipeline.ts — wire owner-intake cases into the existing 24/7 ops pipeline.
 *
 * Adapters (all pure, no I/O, no sends):
 * - intakeToActivity()      → lib/ops-cycles/dormant-reengagement.ts (CaseActivity)
 * - intakeRoundInput()      → lib/ops-cycles/round-sequencer.ts (R1→R2→R3)
 * - openDisputeWindow()     → lib/ops-cycles/investigation-windows.ts (30/45-day FCRA windows)
 * - describePipelineState() → Spanish-first owner summary of where a case stands
 * - advanceIntakeRound()     → apply the sequencer decision and persist round/window fields
 *
 * Nothing here sends anything or fabricates disputes: round advancement only
 * follows the sequencer's own rules, and every customer-facing artifact
 * (dispute letters, nudges) remains draft-only in the approval queue.
 */
import { nextRound, type RoundInput } from "../ops-cycles/round-sequencer";
import {
  openWindow,
  type Bureau,
  type DisputeRound,
  type InvestigationWindow
} from "../ops-cycles/investigation-windows";
import type { CaseActivity } from "../ops-cycles/dormant-reengagement";
import {
  updatePipelineFields,
  type IntakeCase,
  type PublicIntakeCase
} from "./intake";

/** Cases → dormant-nudge activity feed input (uses updatedAt as last activity). */
export function intakeToActivity(cases: IntakeCase[]): CaseActivity[] {
  return cases.map((c) => ({ caseId: c.id, lastEventAt: c.updatedAt }));
}

/** A case in dispute → round-sequencer input. Null until the case is in dispute. */
export function intakeRoundInput(c: IntakeCase | PublicIntakeCase): RoundInput | null {
  if (c.disputeRound === null || c.disputeRound === "done" || c.windowStatus === null) return null;
  return { round: c.disputeRound, windowStatus: c.windowStatus };
}

/**
 * Open the FCRA investigation window for a dispute round.
 * 30 days standard, 45 days when the dispute stems from the free annual report.
 */
export function openDisputeWindow(
  caseId: string,
  bureau: Bureau,
  round: DisputeRound,
  openedAt: string,
  freeAnnualReport = false
): InvestigationWindow {
  return openWindow({ caseId, bureau, round, openedAt, freeAnnualReport });
}

const STATUS_ES: Record<string, string> = {
  new: "Nuevo",
  report_received: "Reporte recibido",
  analyzing: "En análisis",
  ready_for_round1: "Listo para ronda 1",
  in_dispute: "En disputa",
  done: "Completado",
  closed: "Cerrado"
};

const WINDOW_ES: Record<string, string> = {
  open: "abierta",
  closed: "cerrada",
  overdue: "vencida"
};

/** Spanish-first owner summary of a case's pipeline position. */
export function describePipelineState(c: IntakeCase | PublicIntakeCase, lang: "es" | "en" = "es"): string {
  const statusLabel = lang === "es" ? (STATUS_ES[c.status] ?? c.status) : c.status;
  if (c.status !== "in_dispute" || c.disputeRound === null) {
    return lang === "es"
      ? `${c.customerName} — ${statusLabel}.`
      : `${c.customerName} — ${statusLabel}.`;
  }
  if (c.disputeRound === "done") {
    return lang === "es"
      ? `${c.customerName} — ${statusLabel}. Secuencia de rondas completada.`
      : `${c.customerName} — ${statusLabel}. Round sequence complete.`;
  }
  const input = intakeRoundInput(c);
  if (!input) {
    return lang === "es" ? `${c.customerName} — ${statusLabel}.` : `${c.customerName} — ${statusLabel}.`;
  }
  const decision = nextRound(input);
  const windowLabel = c.windowStatus ? (lang === "es" ? (WINDOW_ES[c.windowStatus] ?? c.windowStatus) : c.windowStatus) : "?";
  if (lang === "es") {
    if (decision.action === "advance") {
      return `${c.customerName} — Ronda ${c.disputeRound} ${windowLabel}: lista para avanzar a la ronda ${decision.nextRound} (pendiente de su aprobación).`;
    }
    if (decision.action === "done") {
      return `${c.customerName} — Ronda ${c.disputeRound} ${windowLabel}: secuencia completada.`;
    }
    return `${c.customerName} — Ronda ${c.disputeRound} ${windowLabel}: en espera de la respuesta del buró.`;
  }
  if (decision.action === "advance") {
    return `${c.customerName} — Round ${c.disputeRound} ${windowLabel}: ready to advance to round ${decision.nextRound} (pending your approval).`;
  }
  if (decision.action === "done") {
    return `${c.customerName} — Round ${c.disputeRound} ${windowLabel}: sequence complete.`;
  }
  return `${c.customerName} — Round ${c.disputeRound} ${windowLabel}: waiting on the bureau response.`;
}

export interface RoundAdvanceResult {
  caseId: string;
  action: "wait" | "advance" | "done" | "not_in_dispute";
  disputeRound: IntakeCase["disputeRound"];
  windowStatus: IntakeCase["windowStatus"];
  status: IntakeCase["status"];
  reason: string;
}

/**
 * Apply the round sequencer to a case and persist the outcome.
 * - not_in_dispute → nothing to sequence yet.
 * - wait          → window still open/overdue; fields unchanged.
 * - advance       → disputeRound moves to the next round (window re-opens on the next openDisputeWindow call).
 * - done          → disputeRound "done", case status "done".
 *
 * Advancing a round only changes bookkeeping — the actual dispute letter for
 * the next round is still drafted into the approval queue, never sent.
 */
export function advanceIntakeRound(
  record: IntakeCase,
  organizationId: string
): RoundAdvanceResult {
  const input = intakeRoundInput(record);
  if (!input) {
    return {
      caseId: record.id,
      action: "not_in_dispute",
      disputeRound: record.disputeRound,
      windowStatus: record.windowStatus,
      status: record.status,
      reason: "Case is not in the dispute pipeline yet."
    };
  }
  const decision = nextRound(input);
  if (decision.action === "wait") {
    return {
      caseId: record.id,
      action: "wait",
      disputeRound: record.disputeRound,
      windowStatus: record.windowStatus,
      status: record.status,
      reason: decision.reason
    };
  }
  if (decision.action === "done") {
    const updated = updatePipelineFields(record.id, organizationId, {
      disputeRound: "done",
      windowStatus: "closed",
      status: "done"
    });
    return {
      caseId: record.id,
      action: "done",
      disputeRound: updated.disputeRound,
      windowStatus: updated.windowStatus,
      status: updated.status,
      reason: decision.reason
    };
  }
  const updated = updatePipelineFields(record.id, organizationId, {
    disputeRound: decision.nextRound ?? record.disputeRound,
    windowStatus: "open",
    status: "in_dispute"
  });
  return {
    caseId: record.id,
    action: "advance",
    disputeRound: updated.disputeRound,
    windowStatus: updated.windowStatus,
    status: updated.status,
    reason: decision.reason
  };
}
