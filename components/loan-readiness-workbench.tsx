'use client';

import { useEffect, useMemo, useState } from 'react';
import { calculateLoanReadiness, loanReadinessGoals } from '@/lib/loan-readiness-engine';
import type { ClientProfile, LoanReadinessAssessment, LoanReadinessGoal } from '@/lib/platform-types';

export function LoanReadinessWorkbench() {
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [clientId, setClientId] = useState('');
  const [goal, setGoal] = useState<LoanReadinessGoal>('mortgage');
  const [creditScore, setCreditScore] = useState(620);
  const [utilization, setUtilization] = useState(48);
  const [monthlyIncome, setMonthlyIncome] = useState(6500);
  const [monthlyDebt, setMonthlyDebt] = useState(2400);
  const [onTimePaymentRate, setOnTimePaymentRate] = useState(96);
  const [derogatories, setDerogatories] = useState(1);
  const [hardInquiries, setHardInquiries] = useState(3);
  const [cashReserves, setCashReserves] = useState(3000);
  const [history, setHistory] = useState<LoanReadinessAssessment[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const inputs = useMemo(() => ({ goal, creditScore, utilization, monthlyIncome, monthlyDebt, onTimePaymentRate, derogatories, hardInquiries, cashReserves }), [goal, creditScore, utilization, monthlyIncome, monthlyDebt, onTimePaymentRate, derogatories, hardInquiries, cashReserves]);
  const assessment = useMemo(() => calculateLoanReadiness(inputs), [inputs]);
  const selectedClient = useMemo(() => clients.find((client) => client.id === clientId), [clients, clientId]);
  const previousForGoal = useMemo(() => history.find((item) => item.goal === goal), [history, goal]);
  const readinessDelta = previousForGoal ? assessment.readiness - previousForGoal.readinessScore : null;
  const roadmapGroups = useMemo(() => [
    { label: 'NEXT 7 DAYS', actions: assessment.actions.filter((action) => (action.targetDay || 90) <= 7) },
    { label: 'BY DAY 30', actions: assessment.actions.filter((action) => (action.targetDay || 90) > 7 && (action.targetDay || 90) <= 30) },
    { label: 'BY DAY 60', actions: assessment.actions.filter((action) => (action.targetDay || 90) > 30 && (action.targetDay || 90) <= 60) },
    { label: 'BY DAY 90', actions: assessment.actions.filter((action) => (action.targetDay || 90) > 60) }
  ].filter((group) => group.actions.length), [assessment.actions]);

  useEffect(() => {
    fetch('/api/clients').then((r) => r.json()).then((data) => {
      const list = Array.isArray(data.clients) ? data.clients as ClientProfile[] : [];
      setClients(list);
      if (list.length) setClientId((current) => current || list[0].id);
    }).catch(() => setMessage('Unable to load clients.'));
  }, []);

  useEffect(() => {
    if (!clientId) { setHistory([]); return; }
    fetch(`/api/loan-readiness?clientId=${encodeURIComponent(clientId)}`).then((r) => r.json()).then((data) => setHistory(Array.isArray(data.history) ? data.history : [])).catch(() => setHistory([]));
  }, [clientId]);

  async function saveAssessment() {
    if (!clientId) { setMessage('Select a client before saving.'); return; }
    setSaving(true); setMessage('');
    try {
      const response = await fetch('/api/loan-readiness', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientId, ...inputs }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Save failed');
      setHistory((current) => [data.assessment as LoanReadinessAssessment, ...current].slice(0, 25));
      setMessage('Assessment saved to the client readiness history.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to save assessment.');
    } finally { setSaving(false); }
  }

  return (
    <div className="grid">
      <section className="card span12">
        <div className="row">
          <div>
            <div className="label">CREDIT REPAIR MASTERS · APPROVAL READINESS</div>
            <h1 style={{ marginBottom: 6 }}>{assessment.target.label} Readiness</h1>
            <div className="small">{selectedClient ? `${selectedClient.displayName} · ${selectedClient.state} · ${selectedClient.kind}` : 'Select a client'} · Assessment planning workspace</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className={`pill ${assessment.shopGate.ready ? 'low' : 'high'}`}>{assessment.shopGate.label}</span>
            <div className="small" style={{ marginTop: 8 }}>{assessment.p0Blockers.length} modeled P0 blocker{assessment.p0Blockers.length === 1 ? '' : 's'} remaining</div>
          </div>
        </div>
      </section>

      <section className="card span5">
        <div className="label">CLIENT + CREDIT GOAL</div><h2>What is the client preparing to apply for?</h2>
        <div style={{ display: 'grid', gap: 12 }}>
          <label>Client<select value={clientId} onChange={(e) => setClientId(e.target.value)}><option value="">Select client</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.displayName} · {client.state}</option>)}</select></label>
          <label>Goal<select value={goal} onChange={(e) => setGoal(e.target.value as LoanReadinessGoal)}>{Object.entries(loanReadinessGoals).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}</select></label>
          <label>Credit score<input type="number" min="300" max="850" value={creditScore} onChange={(e) => setCreditScore(Number(e.target.value))} /></label>
          <label>Revolving utilization %<input type="number" min="0" max="100" value={utilization} onChange={(e) => setUtilization(Number(e.target.value))} /></label>
          <label>Gross monthly income<input type="number" min="0" value={monthlyIncome} onChange={(e) => setMonthlyIncome(Number(e.target.value))} /></label>
          <label>Required monthly debt payments<input type="number" min="0" value={monthlyDebt} onChange={(e) => setMonthlyDebt(Number(e.target.value))} /></label>
          <label>On-time payment rate %<input type="number" min="0" max="100" value={onTimePaymentRate} onChange={(e) => setOnTimePaymentRate(Number(e.target.value))} /></label>
          <label>Derogatory items<input type="number" min="0" value={derogatories} onChange={(e) => setDerogatories(Number(e.target.value))} /></label>
          <label>Recent hard inquiries<input type="number" min="0" value={hardInquiries} onChange={(e) => setHardInquiries(Number(e.target.value))} /></label>
          <label>Cash reserves<input type="number" min="0" value={cashReserves} onChange={(e) => setCashReserves(Number(e.target.value))} /></label>
          <button className="primaryButton" type="button" onClick={saveAssessment} disabled={saving || !clientId}>{saving ? 'Saving…' : 'Save Readiness Snapshot'}</button>
          {message ? <div className="small">{message}</div> : null}
        </div>
      </section>

      <section className="card span7">
        <div className="label">CREDIT APPROVAL READINESS</div>
        <div className="row"><div><h2>{assessment.target.label}</h2><div className="small">Cross-product planning model — not a lender approval guarantee</div></div><span className={`pill ${assessment.readiness >= 85 ? 'low' : assessment.readiness >= 70 ? 'medium' : 'high'}`}>{assessment.status}</span></div>
        <div style={{ margin: '22px 0 14px' }}><strong style={{ fontSize: 54 }}>{assessment.readiness}</strong><span className="small"> / 100 modeled readiness</span>{readinessDelta !== null ? <div className="small">{readinessDelta >= 0 ? '+' : ''}{readinessDelta} points versus latest saved {loanReadinessGoals[goal].label} assessment</div> : <div className="small">Save the first snapshot to establish a measurable baseline.</div>}</div>
        <div className="ownerKpiGrid">
          <div className="ownerKpi"><span>MODELED DTI</span><strong>{assessment.dti.toFixed(1)}%</strong><small>planning target ≤ {assessment.target.dtiTarget}%</small></div>
          <div className="ownerKpi"><span>UTILIZATION</span><strong>{utilization}%</strong><small>planning target ≤ {assessment.target.utilizationTarget}%</small></div>
          <div className="ownerKpi"><span>CREDIT PROFILE</span><strong>{creditScore}</strong><small>planning target {assessment.target.scoreTarget}+</small></div>
          <div className="ownerKpi"><span>RESERVES</span><strong>{assessment.reserveMonths.toFixed(1)}x</strong><small>target {assessment.target.reserveMonths}+ months</small></div>
        </div>
      </section>

      <section className="card span12">
        <div className="label">EXPLAINABLE SCORE</div><h2>Why the readiness score is where it is</h2>
        <div className="ownerKpiGrid">
          {assessment.components.map((component) => <div className="ownerKpi" key={component.id}><span>{component.label.toUpperCase()}</span><strong>{component.score}/100</strong><small>Current {component.current} · target {component.target}</small></div>)}
        </div>
      </section>

      <section className="card span12">
        <div className="label">30 / 60 / 90-DAY READINESS PLAN</div><h2>Highest-impact actions before applying</h2>
        {roadmapGroups.map((group) => <div key={group.label} style={{ marginTop: 18 }}><div className="label">{group.label}</div>{group.actions.map((action, index) => <div className="listRow" key={`${action.title}-${index}`}><div><strong>{action.title}</strong><div className="small">{action.detail}{action.targetDay ? ` · Target: day ${action.targetDay}` : ''}</div></div><span className={`pill ${action.priority === 'P0' ? 'high' : action.priority === 'P1' ? 'medium' : 'low'}`}>{action.priority}</span></div>)}</div>)}
      </section>

      <section className="card span12">
        <div className="label">APPLICATION READINESS GATE</div><div className="row"><div><h2>{assessment.shopGate.label}</h2><div className="small">This is a planning gate for when to begin comparing credit options, not an approval decision.</div></div><span className={`pill ${assessment.shopGate.ready ? 'low' : 'high'}`}>{assessment.shopGate.ready ? 'SHOP CAREFULLY' : 'KEEP BUILDING'}</span></div>
        {assessment.shopGate.reasons.map((reason, index) => <div className="listRow" key={`${reason}-${index}`}><div><strong>{assessment.shopGate.ready ? 'Final review' : `Blocker ${index + 1}`}</strong><div className="small">{reason}</div></div></div>)}
      </section>

      <section className="card span12">
        <div className="label">CLIENT READINESS HISTORY</div><h2>Reassessment timeline</h2>
        {history.length ? history.map((item, index) => {
          const older = history[index + 1];
          const delta = older && older.goal === item.goal ? item.readinessScore - older.readinessScore : null;
          return <div className="listRow" key={item.id}><div><strong>{loanReadinessGoals[item.goal].label} · {item.readinessScore}/100 {delta !== null ? `· ${delta >= 0 ? '+' : ''}${delta}` : ''}</strong><div className="small">{new Date(item.createdAt).toLocaleString()} · DTI {item.dti.toFixed(1)}% · Utilization {item.utilization}% · Credit {item.creditScore}</div></div><span className={`pill ${item.readinessScore >= 85 ? 'low' : item.readinessScore >= 70 ? 'medium' : 'high'}`}>{item.status}</span></div>;
        }) : <div className="emptyState">No saved readiness snapshots for this client yet. Save the current assessment to establish the baseline.</div>}
      </section>

      <section className="card span12"><div className="label">COMPLIANCE GUARDRAIL</div><h2>Prepare customers for stronger applications — never promise approval.</h2><p className="small">This workbench provides education, readiness planning and modeled targets. Actual underwriting criteria vary by lender, product, collateral, income documentation, jurisdiction and the applicant’s complete credit profile. A high readiness score is not an approval. Dispute only information the consumer identifies as inaccurate or incomplete; do not misrepresent identity, income, employment, assets, tradelines or application facts.</p></section>
    </div>
  );
}
