/**
 * round-sequencer.ts
 *
 * Dispute round sequencing R1 → R2 → R3.
 *
 * - A round advances only after the prior round's bureau window is closed.
 * - Escalation posture intensifies per round:
 *   R1 → factual verification (FCRA §611)
 *   R2 → method-of-verification challenge
 *   R3 → CFPB mention / federal complaint track
 *
 * Pure logic. No I/O, no sends.
 */

import type { DisputeRound, WindowStatus } from "./investigation-windows";

export type RoundState = DisputeRound | "done";

export type SequencerAction = "wait" | "advance" | "done";

export interface RoundDecision {
  action: SequencerAction;
  nextRound?: DisputeRound;
  reason: string;
}

export interface RoundInput {
  round: RoundState;
  windowStatus: WindowStatus;
}

/**
 * Decide what the round state allows next.
 * - 'done'          → { action: 'done' } — nothing more to sequence.
 * - window 'open'   → { action: 'wait' } — bureau investigation in flight.
 * - window 'overdue'→ { action: 'wait' } — overdue is handled by escalation, not advancement.
 * - window 'closed' → { action: 'advance', nextRound } — R1→R2, R2→R3, R3→'done'.
 */
export function nextRound(state: RoundInput): RoundDecision {
  if (state.round === "done") {
    return { action: "done", reason: "All three rounds completed." };
  }
  if (state.windowStatus !== "closed") {
    return {
      action: "wait",
      reason:
        state.windowStatus === "overdue"
          ? `Round R${state.round} window is overdue — handled via escalation track, not advancement.`
          : `Round R${state.round} investigation window is still open — wait for the bureau response.`
    };
  }
  switch (state.round) {
    case 1:
      return { action: "advance", nextRound: 2, reason: "R1 window closed — eligible to sequence R2." };
    case 2:
      return { action: "advance", nextRound: 3, reason: "R2 window closed — eligible to sequence R3." };
    case 3:
      return { action: "done", reason: "R3 window closed — dispute sequencing complete." };
  }
}

/**
 * Escalation posture label per round (Spanish, client-facing copy).
 */
export function escalationLevel(round: DisputeRound): string {
  switch (round) {
    case 1:
      return "Verificación factual (FCRA §611)";
    case 2:
      return "Método de verificación";
    case 3:
      return "Mención CFPB";
  }
}

const BUREAU_LABEL: Record<string, string> = {
  equifax: "Equifax",
  experian: "Experian",
  transunion: "TransUnion"
};

/**
 * Human-readable Spanish summary of the dispute plan for a case.
 */
export function describePlan(caseId: string, bureau?: string): string {
  const bureauName = bureau ? (BUREAU_LABEL[bureau.toLowerCase()] ?? bureau) : "los burós";
  return [
    `Plan de disputa — caso ${caseId} (${bureauName})`,
    ``,
    `Ronda 1 — ${escalationLevel(1)}: disputamos las imprecisiones con evidencia`,
    `documentada. El buró tiene 30 días (FCRA §611) para investigar y responder.`,
    ``,
    `Ronda 2 — ${escalationLevel(2)}: si la Ronda 1 no corrige el error, exigimos el`,
    `método de verificación usado, para obligar una revisión a fondo.`,
    ``,
    `Ronda 3 — ${escalationLevel(3)}: si la Ronda 2 tampoco resuelve, se prepara un`,
    `reclamo formal ante la CFPB. Cada paso requiere tu aprobación antes de enviarse.`,
    ``,
    `Ninguna carta se envía sin tu aprobación. Sin promesas de puntaje: trabajamos`,
    `sobre la precisión de la información reportada.`
  ].join("\n");
}
