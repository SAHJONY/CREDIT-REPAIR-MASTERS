export type ProposedAction =
  | { kind: "analyze"; evidence?: string[] }
  | { kind: "draft_dispute"; evidence?: string[]; assertion?: string }
  | { kind: "submit_dispute"; evidence?: string[]; consentId?: string; assertion?: string }
  | { kind: "make_payment"; consentId?: string; amount?: number }
  | { kind: "open_credit"; consentId?: string }
  | { kind: "identity_theft_claim"; evidence?: string[]; consentId?: string };

export function evaluateAction(action: ProposedAction) {
  if (action.kind === "analyze") {
    return { allowed: true, approval: false, reason: "Read-only analysis." };
  }

  if (action.kind === "draft_dispute") {
    const evidenceCount = action.evidence?.length ?? 0;
    if (!evidenceCount) return { allowed: false, approval: false, reason: "Evidence required before dispute drafting." };
    return { allowed: true, approval: false, reason: "Drafting is allowed with linked evidence." };
  }

  if (action.kind === "submit_dispute") {
    if (!(action.evidence?.length ?? 0)) return { allowed: false, approval: false, reason: "Submission blocked: no evidence." };
    if (!action.consentId) return { allowed: false, approval: false, reason: "Submission blocked: client authorization missing." };
    return { allowed: true, approval: true, reason: "Submission requires explicit client approval." };
  }

  if (action.kind === "make_payment" || action.kind === "open_credit") {
    return action.consentId
      ? { allowed: true, approval: true, reason: "Sensitive financial action requires explicit approval." }
      : { allowed: false, approval: false, reason: "Sensitive financial action blocked without authorization." };
  }

  if (action.kind === "identity_theft_claim") {
    if (!(action.evidence?.length ?? 0)) {
      return { allowed: false, approval: false, reason: "Identity-theft allegation blocked without evidence." };
    }
    return { allowed: true, approval: true, reason: "Identity-theft workflow requires evidence and explicit approval." };
  }

  return { allowed: false, approval: false, reason: "Unknown action." };
}
