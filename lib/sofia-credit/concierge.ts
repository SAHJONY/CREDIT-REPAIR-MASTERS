/**
 * Sofia WhatsApp concierge — draft builder for the New850 credit repair app.
 *
 * DRAFT-ONLY: every outbound client message is built here as a DraftMessage
 * with status 'pending_approval'. Nothing in this module (or anywhere under
 * lib/sofia-credit/) performs a send. Approval and manual dispatch happen
 * outside the code path — see queue.ts and the owner approval queue.
 *
 * Governance notes:
 * - The concierge is NOT a registry agent (lib/agent-registry.ts). It operates
 *   strictly under approval_required semantics; see guards.ts.
 * - Business routing: the WhatsApp number +12816628581 is shared across
 *   Sofia businesses, but each draft carries its own business context
 *   (businessId: 'credit_repair') and data is never mixed across businesses
 *   (config/sofia-business-routing.json, cross_business_data_leakage: false).
 * - Bodies are warm, concise (<=400 chars), Spanish by default, with no score
 *   promises and no legal advice.
 */
import { evaluateAction, type PolicyEvaluation, type ProposedAction } from "../compliance";

export type DraftKind =
  | "status_update"
  | "document_request"
  | "follow_up"
  | "round_notification"
  | "window_expiry"
  | "dormant_nudge"
  | "case_closed";

export type DraftLanguage = "es" | "en";

export interface DraftMessage {
  id: string; // draft_wa_...
  channel: "whatsapp";
  to: string;
  body: string;
  language: DraftLanguage;
  // Builders always return 'pending_approval'. The approval queue may later
  // transition a draft to 'approved' or 'rejected' (owner decision). 'sent'
  // exists as a value but is never assigned by code (dispatch is manual).
  status: "pending_approval" | "approved" | "rejected" | "sent";
  authority: "approval_required";
  caseId: string;
  clientName: string;
  kind: DraftKind;
  createdBy: "sofia-credit-concierge";
  createdAt: string; // ISO
}

const CTA_ES = "Responde a este mensaje si tienes preguntas. — Sofia";
const CTA_EN = "Reply to this message if you have questions. — Sofia";

const MAX_BODY_LENGTH = 400;

function maskPhoneForId(): string {
  // IDs must not leak the destination; use a time+random component only.
  return `draft_wa_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function makeDraft(input: {
  to: string;
  body: string;
  language: DraftLanguage;
  caseId: string;
  clientName: string;
  kind: DraftKind;
}): DraftMessage {
  const body = input.body.trim();
  if (body.length > MAX_BODY_LENGTH) {
    throw new Error(
      `Draft body exceeds WhatsApp-length limit (${body.length}/${MAX_BODY_LENGTH} chars).`
    );
  }
  return {
    id: maskPhoneForId(),
    channel: "whatsapp",
    to: input.to,
    body,
    language: input.language,
    status: "pending_approval",
    authority: "approval_required",
    caseId: input.caseId,
    clientName: input.clientName,
    kind: input.kind,
    createdBy: "sofia-credit-concierge",
    createdAt: new Date().toISOString(),
  };
}

/** Case status update: progress is shared, no score promises are made. */
export function statusUpdate(input: {
  to: string;
  caseId: string;
  clientName: string;
  statusLine: string;
  language?: DraftLanguage;
}): DraftMessage {
  const lang = input.language ?? "es";
  const body =
    lang === "en"
      ? `Hi ${input.clientName}, Sofia here with a New850 update: ${input.statusLine}. We'll keep working through the rounds — no action needed from you right now. ${CTA_EN}`
      : `Hola ${input.clientName}, Sofia te saluda con una actualización de New850: ${input.statusLine}. Seguimos avanzando ronda por ronda — por ahora no necesitas hacer nada. ${CTA_ES}`;
  return makeDraft({ ...input, body, language: lang, kind: "status_update" });
}

/** Request missing documents from the client. */
export function documentRequest(input: {
  to: string;
  caseId: string;
  clientName: string;
  missingDocs: string[];
  language?: DraftLanguage;
}): DraftMessage {
  const lang = input.language ?? "es";
  const docs = input.missingDocs.join(", ");
  const body =
    lang === "en"
      ? `Hi ${input.clientName}, Sofia here — to keep your New850 case moving we still need: ${docs}. You can reply here and I'll guide you through it. ${CTA_EN}`
      : `Hola ${input.clientName}, Sofia te saluda — para seguir avanzando tu caso en New850 aún necesitamos: ${docs}. Puedes responder aquí y te guío paso a paso. ${CTA_ES}`;
  return makeDraft({ ...input, body, language: lang, kind: "document_request" });
}

/** Follow-up with the client's next step. */
export function followUp(input: {
  to: string;
  caseId: string;
  clientName: string;
  nextStep: string;
  language?: DraftLanguage;
}): DraftMessage {
  const lang = input.language ?? "es";
  const body =
    lang === "en"
      ? `Hi ${input.clientName}, Sofia here — a quick New850 reminder: ${input.nextStep}. Whenever you're ready, reply here and we'll pick it up together. ${CTA_EN}`
      : `Hola ${input.clientName}, Sofia te saluda — un recordatorio de New850: ${input.nextStep}. Cuando estés listo, responde aquí y lo seguimos juntos. ${CTA_ES}`;
  return makeDraft({ ...input, body, language: lang, kind: "follow_up" });
}

/** Notify that a dispute round was filed with a bureau. */
export function roundNotification(input: {
  to: string;
  caseId: string;
  clientName: string;
  round: number;
  bureau: string;
  language?: DraftLanguage;
}): DraftMessage {
  const lang = input.language ?? "es";
  const body =
    lang === "en"
      ? `Hi ${input.clientName}, Sofia here — New850 round ${input.round} is now filed with ${input.bureau}. We'll watch the response window and update you as soon as there's movement. ${CTA_EN}`
      : `Hola ${input.clientName}, Sofia te saluda — la ronda ${input.round} de New850 ya quedó enviada a ${input.bureau}. Vigilaré el tiempo de respuesta y te aviso en cuanto haya movimiento. ${CTA_ES}`;
  return makeDraft({ ...input, body, language: lang, kind: "round_notification" });
}

/** Alert that a response window has expired without movement. */
export function windowExpiry(input: {
  to: string;
  caseId: string;
  clientName: string;
  daysOverdue: number;
  language?: DraftLanguage;
}): DraftMessage {
  const lang = input.language ?? "es";
  const body =
    lang === "en"
      ? `Hi ${input.clientName}, Sofia here — the ${input.daysOverdue}-day response window on your New850 case has passed with no bureau reply. I'll escalate the next step for your review — no action needed yet. ${CTA_EN}`
      : `Hola ${input.clientName}, Sofia te saluda — pasaron ${input.daysOverdue} días sin respuesta del buró en tu caso de New850. Prepararé el siguiente paso para tu revisión — por ahora no necesitas hacer nada. ${CTA_ES}`;
  return makeDraft({ ...input, body, language: lang, kind: "window_expiry" });
}

/** Re-engage a client whose case went dormant. */
export function dormantNudge(input: {
  to: string;
  caseId: string;
  clientName: string;
  daysIdle: number;
  language?: DraftLanguage;
}): DraftMessage {
  const lang = input.language ?? "es";
  const body =
    lang === "en"
      ? `Hi ${input.clientName}, Sofia here — it's been ${input.daysIdle} days since your New850 case had movement. Want to pick it back up? Just reply here and I'll lay out the next step. ${CTA_EN}`
      : `Hola ${input.clientName}, Sofia te saluda — han pasado ${input.daysIdle} días sin movimiento en tu caso de New850. ¿Quieres retomarlo? Solo responde aquí y te muestro el siguiente paso. ${CTA_ES}`;
  return makeDraft({ ...input, body, language: lang, kind: "dormant_nudge" });
}

/** Notify that the case is closed — warm, no promises of permanence. */
export function caseClosed(input: {
  to: string;
  caseId: string;
  clientName: string;
  language?: DraftLanguage;
}): DraftMessage {
  const lang = input.language ?? "es";
  const body =
    lang === "en"
      ? `Hi ${input.clientName}, Sofia here — your New850 case is now closed. Thank you for working through it with us; keep your reports handy and check them regularly. ${CTA_EN}`
      : `Hola ${input.clientName}, Sofia te saluda — tu caso en New850 ya quedó cerrado. Gracias por este proceso con nosotros; guarda tus reportes y revísalos con regularidad. ${CTA_ES}`;
  return makeDraft({ ...input, body, language: lang, kind: "case_closed" });
}

/**
 * Classify a draft send through the compliance policy engine.
 *
 * Outbound WhatsApp sends are customer-facing, binding external actions.
 * Per governance (binding_actions_require_owner_approval: true) the concierge
 * models the send as a submit-style external action and runs it through
 * evaluateAction():
 *   - no owner/client consent        -> { allowed: false }        (blocked)
 *   - explicit consent (approval)    -> { allowed: true, approval: true } (approval_required)
 * A plain 'allowed' result (allowed && !approval) can NEVER occur here: the
 * concierge never has autonomous-send authority. This function asserts that
 * invariant and throws if the policy engine ever says otherwise — a loud
 * failure that extends the authority boundaries rather than weakening them.
 */
export function classifyWithPolicy(
  kind: DraftKind,
  opts: { evidenceCount?: number; consentId?: string } = {}
): PolicyEvaluation {
  const evidenceCount = Math.max(opts.evidenceCount ?? 1, 1);
  const evidence = Array.from(
    { length: evidenceCount },
    (_, i) => `concierge-draft:${kind}:${i}`
  );
  const action: ProposedAction = { kind: "submit_dispute", evidence, consentId: opts.consentId };
  const result = evaluateAction(action);

  const isAllowed = result.allowed;
  const isApprovalRequired = result.allowed && result.approval;
  const isBlocked = !result.allowed;

  if (!isApprovalRequired && !isBlocked) {
    // 'allowed' with no approval gate — forbidden for the concierge.
    throw new Error(
      `concierge policy violation: draft kind "${kind}" evaluated as plain 'allowed' ` +
        `(${result.reason}). The concierge must never hold autonomous-send authority.`
    );
  }
  return result;
}

/** True when the policy evaluation requires approval (not a plain allow). */
export function isApprovalRequired(result: PolicyEvaluation): boolean {
  return result.allowed && result.approval;
}

/** True when the policy evaluation blocks the action outright. */
export function isBlocked(result: PolicyEvaluation): boolean {
  return !result.allowed;
}
