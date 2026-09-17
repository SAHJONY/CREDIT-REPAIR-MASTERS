/**
 * Draft-only guards for the Sofia credit-repair concierge.
 *
 * Authority model (extends, never weakens, the existing boundaries):
 * - The concierge is NOT a registry agent in lib/agent-registry.ts. It holds
 *   no autonomous authority of its own; every draft it produces is stamped
 *   authority: 'approval_required' and status: 'pending_approval'.
 * - checkConciergeAuthority() verifies this against the registry:
 *   (1) the concierge id is absent from the registry (no autonomous grant),
 *   (2) the compliance guardian (the policy classifier) is present, so any
 *   escalation still flows through lib/compliance.ts, and
 *   (3) the concierge's declared authority is never 'autonomous'.
 * - assertDraftOnly() throws if a draft is not pending approval, so no code
 *   path can silently advance a draft toward a send.
 */
import { getAgent } from "../agent-registry";
import type { DraftMessage } from "./concierge";

export const CONCIERGE_AUTHORITY = "approval_required" as const;
export const CONCIERGE_AGENT_ID = "sofia-credit-concierge";

/** Throw unless the draft is still awaiting approval. */
export function assertDraftOnly(draft: DraftMessage): void {
  if (draft.status !== "pending_approval") {
    throw new Error(
      `draft-only violation: draft ${draft.id} has status "${draft.status}", expected "pending_approval".`
    );
  }
  if (draft.authority !== CONCIERGE_AUTHORITY) {
    throw new Error(
      `draft-only violation: draft ${draft.id} has authority "${draft.authority}", expected "${CONCIERGE_AUTHORITY}".`
    );
  }
}

/**
 * Verify the concierge's authority posture against the agent registry.
 * Throws on any weakening of the approval_required boundary.
 */
export function checkConciergeAuthority(): { conciergeAuthority: typeof CONCIERGE_AUTHORITY; registryLookup: undefined; complianceGuardian: string } {
  // (1) The concierge must not exist in the registry — it is not granted any
  // registry authority (autonomous or otherwise).
  const registryLookup = getAgent(CONCIERGE_AGENT_ID);
  if (registryLookup !== undefined) {
    throw new Error(
      `authority violation: "${CONCIERGE_AGENT_ID}" unexpectedly present in the agent registry.`
    );
  }

  // (2) The compliance guardian must be present so policy classification of
  // any escalation still routes through lib/compliance.ts.
  const compliance = getAgent("compliance");
  if (!compliance) {
    throw new Error("authority violation: compliance guardian missing from the agent registry.");
  }

  // (3) The concierge's declared authority must never be 'autonomous'.
  if (CONCIERGE_AUTHORITY !== "approval_required") {
    throw new Error(
      `authority violation: concierge authority "${CONCIERGE_AUTHORITY}" is not approval_required.`
    );
  }

  return { conciergeAuthority: CONCIERGE_AUTHORITY, registryLookup, complianceGuardian: compliance.id };
}
