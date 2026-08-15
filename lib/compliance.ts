import type { ConsentRecord, ConsentScope, EvidenceRecord } from "./platform-types";

export type ProposedAction =
  | { kind: "analyze"; evidence?: string[] }
  | { kind: "draft_dispute"; evidence?: string[]; assertion?: string }
  | { kind: "submit_dispute"; evidence?: string[]; consentId?: string; assertion?: string }
  | { kind: "make_payment"; consentId?: string; amount?: number }
  | { kind: "open_credit"; consentId?: string }
  | { kind: "identity_theft_claim"; evidence?: string[]; consentId?: string };

export interface PolicyEvaluation {
  allowed: boolean;
  approval: boolean;
  reason: string;
}

export interface ResolvedPolicyContext {
  evidence: EvidenceRecord[];
  consent?: ConsentRecord;
  now?: Date;
}

export function evaluateAction(action: ProposedAction): PolicyEvaluation {
  if (action.kind === "analyze") {
    return { allowed: true, approval: false, reason: "Read-only analysis." };
  }

  if (action.kind === "draft_dispute") {
    const evidenceCount = action.evidence?.length ?? 0;
    if (!evidenceCount) return { allowed: false, approval: false, reason: "Evidence required before dispute drafting." };
    return { allowed: true, approval: false, reason: "Drafting is structurally eligible with linked evidence; verified evidence is required by the resolved policy gate." };
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
    if (!action.consentId) return { allowed: false, approval: false, reason: "Identity-theft workflow blocked without authorization." };
    return { allowed: true, approval: true, reason: "Identity-theft workflow requires evidence and explicit approval." };
  }

  return { allowed: false, approval: false, reason: "Unknown action." };
}

function requiredConsentScope(action: ProposedAction): ConsentScope | null {
  if (action.kind === "submit_dispute") return "dispute_submission";
  if (action.kind === "make_payment") return "financial_action";
  if (action.kind === "open_credit") return "new_credit";
  if (action.kind === "identity_theft_claim") return "identity_theft_workflow";
  return null;
}

function consentIsValid(consent: ConsentRecord | undefined, scope: ConsentScope, now: Date): boolean {
  if (!consent || !consent.granted || consent.scope !== scope || consent.revokedAt) return false;
  if (consent.expiresAt && new Date(consent.expiresAt).getTime() <= now.getTime()) return false;
  return true;
}

export function evaluateResolvedAction(action: ProposedAction, context: ResolvedPolicyContext): PolicyEvaluation {
  const structural = evaluateAction(action);
  if (!structural.allowed) return structural;
  if (action.kind === "analyze") return structural;

  const requestedEvidence = new Set(action.evidence ?? []);
  const linkedEvidence = context.evidence.filter((item) => requestedEvidence.has(item.id));
  const verifiedEvidence = linkedEvidence.filter((item) => item.verification === "verified");

  if (action.kind === "draft_dispute" || action.kind === "submit_dispute") {
    if (!verifiedEvidence.length) {
      return { allowed: false, approval: false, reason: "Dispute action blocked: no verified evidence is linked to the requested evidence IDs." };
    }
  }

  if (action.kind === "identity_theft_claim") {
    const verifiedIdentityEvidence = verifiedEvidence.filter((item) => item.type === "identity_document");
    if (!verifiedIdentityEvidence.length) {
      return { allowed: false, approval: false, reason: "Identity-theft workflow blocked: verified identity evidence is required." };
    }
  }

  const scope = requiredConsentScope(action);
  if (scope) {
    if (!action.consentId || !context.consent || context.consent.id !== action.consentId) {
      return { allowed: false, approval: false, reason: `Action blocked: ${scope} consent was not resolved for this client.` };
    }
    if (!consentIsValid(context.consent, scope, context.now ?? new Date())) {
      return { allowed: false, approval: false, reason: `Action blocked: ${scope} consent is missing, revoked, expired, not granted, or has the wrong scope.` };
    }
  }

  return structural;
}
