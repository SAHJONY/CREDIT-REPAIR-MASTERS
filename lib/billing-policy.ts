import { getCommercialService } from './service-catalog';

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
}

const STATE_CODES = new Set(['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC']);

function normalizeState(value: string) {
  return value.trim().toUpperCase();
}

export function evaluateBillingEligibility(input: BillingEligibilityInput): BillingEligibilityResult {
  const service = getCommercialService(input.serviceId);
  const state = normalizeState(input.state);
  const reasons: string[] = [];
  const requiredActions: string[] = [];

  if (!service) return { decision: 'blocked', mayCollectNow: false, serviceId: input.serviceId, state, reasons: ['Unknown service.'], requiredActions: ['Select a configured commercial service.'] };
  if (!STATE_CODES.has(state)) return { decision: 'blocked', mayCollectNow: false, serviceId: service.id, state, reasons: ['Unknown or unsupported jurisdiction.'], requiredActions: ['Resolve the client jurisdiction before billing.'] };

  if (service.regulatoryClass !== 'consumer_credit_services') {
    if (service.paymentPolicy === 'manual_quote') return { decision: 'manual_review', mayCollectNow: false, serviceId: service.id, state, reasons: ['Custom-priced service requires an approved quote and contract.'], requiredActions: ['Approve quote and contract before invoicing.'] };
    return { decision: 'eligible', mayCollectNow: true, serviceId: service.id, state, reasons: ['Service is outside the consumer credit-services billing gate.'], requiredActions: [] };
  }

  reasons.push('Consumer credit-services payments are subject to federal and state timing restrictions.');
  if (!input.contractSigned) requiredActions.push('Complete the required written service agreement and disclosures.');
  if (!input.cancellationWindowExpired) requiredActions.push('Confirm the applicable cancellation period has expired before collection.');

  if (input.salesChannel === 'telemarketing') {
    reasons.push('Telemarketing credit-repair sales have additional FTC Telemarketing Sales Rule payment restrictions.');
    requiredActions.push('Route payment timing to compliance review under the TSR; do not use ordinary checkout.');
    return { decision: 'manual_review', mayCollectNow: false, serviceId: service.id, state, reasons, requiredActions };
  }

  if (state === 'FL') {
    reasons.push('Florida restricts advance payment before full performance unless the statutory surety-bond and trust-account conditions are satisfied.');
    if (input.floridaBondAndTrustValidated) {
      requiredActions.push('If collecting before full performance, route funds through the validated statutory trust-account workflow.');
      return { decision: input.contractSigned && input.cancellationWindowExpired ? 'manual_review' : 'deferred', mayCollectNow: false, serviceId: service.id, state, reasons, requiredActions };
    }
  } else {
    reasons.push('This state overlay has not yet been validated for automated consumer-credit billing.');
    requiredActions.push('Complete state-specific legal/compliance review before enabling automated billing in this jurisdiction.');
    return { decision: 'manual_review', mayCollectNow: false, serviceId: service.id, state, reasons, requiredActions };
  }

  if (!input.serviceCompleted) {
    requiredActions.push('Complete the contracted service before collecting payment.');
    return { decision: 'deferred', mayCollectNow: false, serviceId: service.id, state, reasons, requiredActions };
  }
  if (!input.contractSigned || !input.cancellationWindowExpired) return { decision: 'deferred', mayCollectNow: false, serviceId: service.id, state, reasons, requiredActions };

  reasons.push('Service completion and required pre-billing gates are satisfied.');
  return { decision: 'eligible', mayCollectNow: true, serviceId: service.id, state, reasons, requiredActions };
}
