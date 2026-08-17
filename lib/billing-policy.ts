import { getCommercialService } from './service-catalog';
import { resolveStateCompliance } from './state-compliance';

export type SalesChannel = 'web' | 'referral' | 'in_person' | 'telemarketing';
export type BillingDecision = 'eligible' | 'deferred' | 'manual_review' | 'blocked';

export interface BillingEligibilityInput {
  serviceId: string;
  state: string;
  salesChannel: SalesChannel;
  serviceCompleted?: boolean;
  contractSigned?: boolean;
  cancellationWindowExpired?: boolean;
  floridaBondAndTrustValidated?: boolean;
}

export interface BillingEligibilityResult {
  decision: BillingDecision;
  mayCollectNow: boolean;
  serviceId: string;
  state: string;
  reasons: string[];
  requiredActions: string[];
  rulesVersion?: string;
}

export function evaluateBillingEligibility(input: BillingEligibilityInput): BillingEligibilityResult {
  const service = getCommercialService(input.serviceId);
  const rule = resolveStateCompliance(input.state);
  const state = rule.jurisdiction;
  const reasons: string[] = [];
  const requiredActions: string[] = [];

  if (!service) return { decision: 'blocked', mayCollectNow: false, serviceId: input.serviceId, state, reasons: ['Unknown service.'], requiredActions: ['Select a configured commercial service.'] };
  if (rule.mode === 'blocked') return { decision: 'blocked', mayCollectNow: false, serviceId: service.id, state, reasons: ['Unknown or unsupported jurisdiction.'], requiredActions: ['Resolve the client jurisdiction before billing.'] };

  if (service.regulatoryClass !== 'consumer_credit_services') {
    if (service.paymentPolicy === 'manual_quote') return { decision: 'manual_review', mayCollectNow: false, serviceId: service.id, state, reasons: ['Custom-priced service requires an approved quote and contract.'], requiredActions: ['Approve quote and contract before invoicing.'] };
    return { decision: 'eligible', mayCollectNow: true, serviceId: service.id, state, reasons: ['Service is outside the consumer credit-services billing gate.'], requiredActions: [] };
  }

  reasons.push('Consumer credit-services payments are subject to CROA plus the client jurisdiction rule bundle.');

  if (rule.mode !== 'validated') {
    reasons.push(`${rule.name} has not yet been verified for autonomous consumer-credit billing in the active ruleset.`);
    requiredActions.push('Complete state-specific verification against authoritative law before enabling automated collection.');
    return { decision: 'manual_review', mayCollectNow: false, serviceId: service.id, state, reasons, requiredActions };
  }

  if (input.salesChannel === 'telemarketing') {
    reasons.push('Telemarketing credit-repair sales are routed through the FTC Telemarketing Sales Rule payment and consent gate.');
    requiredActions.push('Do not use ordinary hosted checkout until the TSR-specific conditions for this transaction are documented.');
    return { decision: 'manual_review', mayCollectNow: false, serviceId: service.id, state, reasons, requiredActions };
  }

  if (!input.contractSigned) requiredActions.push('Complete the jurisdiction-appropriate written service agreement and required disclosures.');
  if (!input.cancellationWindowExpired) requiredActions.push(`Confirm the applicable ${rule.cancellationDays ?? 'statutory'}-day cancellation period has expired.`);
  if (!input.serviceCompleted) requiredActions.push('Complete the contracted service before collecting payment under the post-performance billing model.');

  if (!input.serviceCompleted || !input.contractSigned || !input.cancellationWindowExpired) {
    return { decision: 'deferred', mayCollectNow: false, serviceId: service.id, state, reasons, requiredActions };
  }

  reasons.push(`${rule.name} rule bundle is validated for the post-performance billing model.`);
  if (rule.advanceFeePolicy === 'preperformance_only_if_bonded_or_trust') {
    reasons.push('This jurisdiction may impose bond/trust conditions on pre-performance collection; this invoice is eligible only because service completion is already evidenced.');
  }
  if (rule.advanceFeePolicy === 'post_performance_only') reasons.push('This jurisdiction prohibits advance collection for covered services; service completion is therefore mandatory.');
  reasons.push('Service completion, written-contract, cancellation-window, and jurisdiction routing gates are satisfied.');

  return { decision: 'eligible', mayCollectNow: true, serviceId: service.id, state, reasons, requiredActions };
}
