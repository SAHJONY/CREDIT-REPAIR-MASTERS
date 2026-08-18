'use client';

import { useMemo, useState } from 'react';

type Goal = 'mortgage' | 'auto' | 'credit_card' | 'personal_loan' | 'business_credit' | 'lease' | 'financed_purchase';

type GoalProfile = {
  label: string;
  scoreTarget: number;
  utilizationTarget: number;
  dtiTarget: number;
  reserveMonths: number;
};

const goals: Record<Goal, GoalProfile> = {
  mortgage: { label: 'Home / Mortgage', scoreTarget: 640, utilizationTarget: 30, dtiTarget: 43, reserveMonths: 2 },
  auto: { label: 'Vehicle / Auto Loan', scoreTarget: 620, utilizationTarget: 35, dtiTarget: 45, reserveMonths: 1 },
  credit_card: { label: 'Credit Card', scoreTarget: 670, utilizationTarget: 30, dtiTarget: 40, reserveMonths: 1 },
  personal_loan: { label: 'Personal Loan', scoreTarget: 660, utilizationTarget: 30, dtiTarget: 40, reserveMonths: 1 },
  business_credit: { label: 'Business Credit / Funding', scoreTarget: 680, utilizationTarget: 30, dtiTarget: 40, reserveMonths: 2 },
  lease: { label: 'Apartment / Lease', scoreTarget: 620, utilizationTarget: 35, dtiTarget: 45, reserveMonths: 1 },
  financed_purchase: { label: 'Any Financed Purchase', scoreTarget: 650, utilizationTarget: 30, dtiTarget: 40, reserveMonths: 1 }
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

export function LoanReadinessWorkbench() {
  const [goal, setGoal] = useState<Goal>('mortgage');
  const [creditScore, setCreditScore] = useState(620);
  const [utilization, setUtilization] = useState(48);
  const [monthlyIncome, setMonthlyIncome] = useState(6500);
  const [monthlyDebt, setMonthlyDebt] = useState(2400);
  const [onTimePaymentRate, setOnTimePaymentRate] = useState(96);
  const [derogatories, setDerogatories] = useState(1);
  const [hardInquiries, setHardInquiries] = useState(3);
  const [cashReserves, setCashReserves] = useState(3000);

  const assessment = useMemo(() => {
    const target = goals[goal];
    const dti = monthlyIncome > 0 ? (monthlyDebt / monthlyIncome) * 100 : 100;
    const reserveMonths = monthlyDebt > 0 ? cashReserves / monthlyDebt : cashReserves > 0 ? 6 : 0;

    const scorePoints = clamp(((creditScore - 500) / Math.max(1, target.scoreTarget - 500)) * 25, 0, 25);
    const paymentPoints = clamp((onTimePaymentRate / 100) * 20, 0, 20);
    const utilizationPoints = utilization <= target.utilizationTarget
      ? 15
      : clamp(15 - ((utilization - target.utilizationTarget) / 70) * 15, 0, 15);
    const dtiPoints = dti <= target.dtiTarget ? 15 : clamp(15 - ((dti - target.dtiTarget) / 45) * 15, 0, 15);
    const derogatoryPoints = clamp(10 - derogatories * 3, 0, 10);
    const inquiryPoints = clamp(10 - Math.max(0, hardInquiries - 1) * 2, 0, 10);
    const reservePoints = clamp((reserveMonths / Math.max(1, target.reserveMonths)) * 5, 0, 5);
    const readiness = Math.round(scorePoints + paymentPoints + utilizationPoints + dtiPoints + derogatoryPoints + inquiryPoints + reservePoints);

    const actions: Array<{ priority: 'P0' | 'P1' | 'P2'; title: string; detail: string }> = [];
    if (creditScore < target.scoreTarget) actions.push({ priority: 'P0', title: `Build toward a ${target.scoreTarget}+ credit profile`, detail: `Current score entered: ${creditScore}. Focus first on accurate reporting, payment history, utilization and aging rather than unnecessary new accounts.` });
    if (utilization > target.utilizationTarget) actions.push({ priority: 'P0', title: `Reduce revolving utilization below ${target.utilizationTarget}%`, detail: `Current utilization entered: ${utilization}%. Prioritize the cards closest to their limits and avoid adding new revolving balances.` });
    if (dti > target.dtiTarget) actions.push({ priority: 'P0', title: `Reduce debt-to-income toward ${target.dtiTarget}% or less`, detail: `Current modeled DTI: ${dti.toFixed(1)}%. Reduce required monthly debt payments or increase documented qualifying income before applying.` });
    if (onTimePaymentRate < 100) actions.push({ priority: 'P0', title: 'Protect perfect payment history going forward', detail: `Current on-time rate entered: ${onTimePaymentRate}%. Automate minimum payments and prevent any new late payments.` });
    if (derogatories > 0) actions.push({ priority: 'P1', title: 'Review derogatory items for accuracy and resolution options', detail: `${derogatories} derogatory item(s) entered. Dispute only inaccurate or incomplete reporting; handle accurate obligations through legitimate resolution strategies.` });
    if (hardInquiries > 2) actions.push({ priority: 'P1', title: 'Pause avoidable new credit applications', detail: `${hardInquiries} recent hard inquiries entered. Let the profile stabilize before adding unnecessary inquiries.` });
    if (reserveMonths < target.reserveMonths) actions.push({ priority: 'P1', title: `Build at least ${target.reserveMonths} month(s) of modeled reserves`, detail: `Current reserves cover about ${reserveMonths.toFixed(1)} month(s) of entered monthly debt obligations.` });
    if (!actions.length) actions.push({ priority: 'P2', title: 'Prepare lender-ready documentation and shop carefully', detail: 'The entered profile meets this planning model’s core targets. Compare actual lender criteria, rates, fees and terms before submitting applications.' });

    const status = readiness >= 85 ? 'READY TO SHOP' : readiness >= 70 ? 'NEAR READY' : readiness >= 50 ? 'BUILDING' : 'NOT READY YET';
    return { readiness, status, dti, reserveMonths, target, actions };
  }, [goal, creditScore, utilization, monthlyIncome, monthlyDebt, onTimePaymentRate, derogatories, hardInquiries, cashReserves]);

  return (
    <div className="grid">
      <section className="card span5">
        <div className="label">CREDIT GOAL</div>
        <h2>What does the client want to get approved for?</h2>
        <div style={{ display: 'grid', gap: 12 }}>
          <label>Goal<select value={goal} onChange={(event) => setGoal(event.target.value as Goal)}>{Object.entries(goals).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}</select></label>
          <label>Credit score<input type="number" min="300" max="850" value={creditScore} onChange={(event) => setCreditScore(Number(event.target.value))} /></label>
          <label>Revolving utilization %<input type="number" min="0" max="100" value={utilization} onChange={(event) => setUtilization(Number(event.target.value))} /></label>
          <label>Gross monthly income<input type="number" min="0" value={monthlyIncome} onChange={(event) => setMonthlyIncome(Number(event.target.value))} /></label>
          <label>Required monthly debt payments<input type="number" min="0" value={monthlyDebt} onChange={(event) => setMonthlyDebt(Number(event.target.value))} /></label>
          <label>On-time payment rate %<input type="number" min="0" max="100" value={onTimePaymentRate} onChange={(event) => setOnTimePaymentRate(Number(event.target.value))} /></label>
          <label>Derogatory items<input type="number" min="0" value={derogatories} onChange={(event) => setDerogatories(Number(event.target.value))} /></label>
          <label>Recent hard inquiries<input type="number" min="0" value={hardInquiries} onChange={(event) => setHardInquiries(Number(event.target.value))} /></label>
          <label>Cash reserves<input type="number" min="0" value={cashReserves} onChange={(event) => setCashReserves(Number(event.target.value))} /></label>
        </div>
      </section>

      <section className="card span7">
        <div className="label">UNIVERSAL APPROVAL READINESS</div>
        <div className="row"><div><h2>{assessment.target.label}</h2><div className="small">Planning model — not a lender approval guarantee</div></div><span className={`pill ${assessment.readiness >= 85 ? 'low' : assessment.readiness >= 70 ? 'medium' : 'high'}`}>{assessment.status}</span></div>
        <div style={{ margin: '22px 0' }}><strong style={{ fontSize: 54 }}>{assessment.readiness}</strong><span className="small"> / 100 readiness</span></div>
        <div className="ownerKpiGrid">
          <div className="ownerKpi"><span>MODELED DTI</span><strong>{assessment.dti.toFixed(1)}%</strong><small>planning target ≤ {assessment.target.dtiTarget}%</small></div>
          <div className="ownerKpi"><span>UTILIZATION</span><strong>{utilization}%</strong><small>planning target ≤ {assessment.target.utilizationTarget}%</small></div>
          <div className="ownerKpi"><span>CREDIT PROFILE</span><strong>{creditScore}</strong><small>planning target {assessment.target.scoreTarget}+</small></div>
          <div className="ownerKpi"><span>RESERVES</span><strong>{assessment.reserveMonths.toFixed(1)}x</strong><small>months of entered debt payments</small></div>
        </div>
      </section>

      <section className="card span12">
        <div className="label">PERSONALIZED APPROVAL ROADMAP</div>
        <h2>Highest-impact actions before applying</h2>
        {assessment.actions.map((action, index) => <div className="listRow" key={`${action.title}-${index}`}><div><strong>{action.title}</strong><div className="small">{action.detail}</div></div><span className={`pill ${action.priority === 'P0' ? 'high' : action.priority === 'P1' ? 'medium' : 'low'}`}>{action.priority}</span></div>)}
      </section>

      <section className="card span12">
        <div className="label">COMPLIANCE GUARDRAIL</div>
        <h2>Help customers become approvable — never promise approval.</h2>
        <p className="small">This workbench provides education, readiness planning and modeled targets. Actual underwriting criteria vary by lender, product, collateral, income documentation, jurisdiction and the applicant’s complete credit profile. Dispute only information the consumer identifies as inaccurate or incomplete; do not misrepresent identity, income, employment, assets, tradelines or application facts.</p>
      </section>
    </div>
  );
}
