import type { LoanReadinessAction, LoanReadinessGoal } from './platform-types';

export type LoanReadinessInputs = {
  goal: LoanReadinessGoal;
  creditScore: number;
  utilization: number;
  monthlyIncome: number;
  monthlyDebt: number;
  onTimePaymentRate: number;
  derogatories: number;
  hardInquiries: number;
  cashReserves: number;
};

export const loanReadinessGoals = {
  mortgage: { label: 'Home / Mortgage', scoreTarget: 640, utilizationTarget: 30, dtiTarget: 43, reserveMonths: 2 },
  auto: { label: 'Vehicle / Auto Loan', scoreTarget: 620, utilizationTarget: 35, dtiTarget: 45, reserveMonths: 1 },
  credit_card: { label: 'Credit Card', scoreTarget: 670, utilizationTarget: 30, dtiTarget: 40, reserveMonths: 1 },
  personal_loan: { label: 'Personal Loan', scoreTarget: 660, utilizationTarget: 30, dtiTarget: 40, reserveMonths: 1 },
  business_credit: { label: 'Business Credit / Funding', scoreTarget: 680, utilizationTarget: 30, dtiTarget: 40, reserveMonths: 2 },
  lease: { label: 'Apartment / Lease', scoreTarget: 620, utilizationTarget: 35, dtiTarget: 45, reserveMonths: 1 },
  financed_purchase: { label: 'Any Financed Purchase', scoreTarget: 650, utilizationTarget: 30, dtiTarget: 40, reserveMonths: 1 }
} as const;

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

export function calculateLoanReadiness(input: LoanReadinessInputs) {
  const target = loanReadinessGoals[input.goal];
  const dti = input.monthlyIncome > 0 ? (input.monthlyDebt / input.monthlyIncome) * 100 : 100;
  const reserveMonths = input.monthlyDebt > 0 ? input.cashReserves / input.monthlyDebt : input.cashReserves > 0 ? 6 : 0;

  const scorePoints = clamp(((input.creditScore - 500) / Math.max(1, target.scoreTarget - 500)) * 25, 0, 25);
  const paymentPoints = clamp((input.onTimePaymentRate / 100) * 20, 0, 20);
  const utilizationPoints = input.utilization <= target.utilizationTarget ? 15 : clamp(15 - ((input.utilization - target.utilizationTarget) / 70) * 15, 0, 15);
  const dtiPoints = dti <= target.dtiTarget ? 15 : clamp(15 - ((dti - target.dtiTarget) / 45) * 15, 0, 15);
  const derogatoryPoints = clamp(10 - input.derogatories * 3, 0, 10);
  const inquiryPoints = clamp(10 - Math.max(0, input.hardInquiries - 1) * 2, 0, 10);
  const reservePoints = clamp((reserveMonths / Math.max(1, target.reserveMonths)) * 5, 0, 5);
  const readiness = Math.round(scorePoints + paymentPoints + utilizationPoints + dtiPoints + derogatoryPoints + inquiryPoints + reservePoints);

  const actions: LoanReadinessAction[] = [];
  if (input.creditScore < target.scoreTarget) actions.push({ priority: 'P0', targetDay: 30, title: `Build toward a ${target.scoreTarget}+ credit profile`, detail: `Current score entered: ${input.creditScore}. Focus first on accurate reporting, payment history, utilization and aging rather than unnecessary new accounts.` });
  if (input.utilization > target.utilizationTarget) actions.push({ priority: 'P0', targetDay: 30, title: `Reduce revolving utilization below ${target.utilizationTarget}%`, detail: `Current utilization entered: ${input.utilization}%. Prioritize the cards closest to their limits and avoid adding new revolving balances.` });
  if (dti > target.dtiTarget) actions.push({ priority: 'P0', targetDay: 60, title: `Reduce debt-to-income toward ${target.dtiTarget}% or less`, detail: `Current modeled DTI: ${dti.toFixed(1)}%. Reduce required monthly debt payments or increase documented qualifying income before applying.` });
  if (input.onTimePaymentRate < 100) actions.push({ priority: 'P0', targetDay: 1, title: 'Protect perfect payment history going forward', detail: `Current on-time rate entered: ${input.onTimePaymentRate}%. Automate minimum payments and prevent any new late payments.` });
  if (input.derogatories > 0) actions.push({ priority: 'P1', targetDay: 45, title: 'Review derogatory items for accuracy and resolution options', detail: `${input.derogatories} derogatory item(s) entered. Dispute only inaccurate or incomplete reporting; handle accurate obligations through legitimate resolution strategies.` });
  if (input.hardInquiries > 2) actions.push({ priority: 'P1', targetDay: 90, title: 'Pause avoidable new credit applications', detail: `${input.hardInquiries} recent hard inquiries entered. Let the profile stabilize before adding unnecessary inquiries.` });
  if (reserveMonths < target.reserveMonths) actions.push({ priority: 'P1', targetDay: 90, title: `Build at least ${target.reserveMonths} month(s) of modeled reserves`, detail: `Current reserves cover about ${reserveMonths.toFixed(1)} month(s) of entered monthly debt obligations.` });
  if (!actions.length) actions.push({ priority: 'P2', targetDay: 7, title: 'Prepare lender-ready documentation and shop carefully', detail: 'The entered profile meets this planning model’s core targets. Compare actual lender criteria, rates, fees and terms before submitting applications.' });

  const status = readiness >= 85 ? 'READY TO SHOP' : readiness >= 70 ? 'NEAR READY' : readiness >= 50 ? 'BUILDING' : 'NOT READY YET';
  return { readiness, status, dti, reserveMonths, target, actions } as const;
}
