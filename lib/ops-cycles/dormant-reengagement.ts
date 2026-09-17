/**
 * dormant-reengagement.ts
 *
 * Detect cases with no client activity for a configurable threshold (default
 * 14 days) and draft a warm Spanish re-engagement nudge.
 *
 * Draft-only. No sends, no score promises.
 */

export interface CaseActivity {
  caseId: string;
  lastEventAt: string; // ISO 8601
}

export interface DormantCase {
  caseId: string;
  lastEventAt: string;
  daysIdle: number;
}

export interface NudgeDraft {
  type: "dormant_nudge_draft";
  caseId: string;
  status: "pending_approval";
  daysIdle: number;
  body: string;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const DEFAULT_DORMANT_THRESHOLD_DAYS = 14;

/**
 * Return cases idle longer than thresholdDays (strictly greater).
 */
export function findDormant(cases: CaseActivity[], nowISO: string, thresholdDays = DEFAULT_DORMANT_THRESHOLD_DAYS): DormantCase[] {
  const nowMs = new Date(nowISO).getTime();
  const out: DormantCase[] = [];
  for (const c of cases) {
    const daysIdle = Math.floor((nowMs - new Date(c.lastEventAt).getTime()) / MS_PER_DAY);
    if (daysIdle > thresholdDays) {
      out.push({ caseId: c.caseId, lastEventAt: c.lastEventAt, daysIdle });
    }
  }
  return out;
}

/**
 * Warm Spanish nudge draft. No promises — no score claims, no timelines, no
 * outcome guarantees. Internal draft, requires approval before any send.
 */
export function draftNudge(c: DormantCase): NudgeDraft {
  const body = [
    `DRAFT — borrador de mensaje de reactivación (pendiente de aprobación).`,
    ``,
    `Hola, ¿cómo estás? Soy Sofia, del equipo de New850.`,
    ``,
    `Pasaba a saludarte y ver cómo va todo con tu caso. Si tienes alguna`,
    `pregunta o necesitas ayuda con algún documento, aquí estoy para apoyarte.`,
    ``,
    `¿Quieres que revisemos juntos el siguiente paso?`
  ].join("\n");
  return {
    type: "dormant_nudge_draft",
    caseId: c.caseId,
    status: "pending_approval",
    daysIdle: c.daysIdle,
    body
  };
}
