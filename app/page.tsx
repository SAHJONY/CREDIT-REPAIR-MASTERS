import { agents, demoEvidence, demoProfile } from "@/lib/demo";
import { buildBrainSnapshot } from "@/lib/orchestrator";
import { readinessChecks, readinessSummary } from "@/lib/readiness";

export default function Home() {
  const snapshot = buildBrainSnapshot(demoProfile, demoEvidence);
  const readiness = readinessSummary();
  const plan = snapshot.paydownPlan;

  return (
    <main>
      <header className="header">
        <div>
          <div className="kicker">CREDIT REPAIR MASTERS / OWNER OS</div>
          <h1>AI Credit Operating System</h1>
          <p className="subtitle">Evidence-first orchestration for consumer and business credit. Every external or sensitive action must cross the policy gateway and consent boundary before execution.</p>
        </div>
        <div className="badge"><span className="dot" /> ChatGPT brain + controlled autonomy</div>
      </header>

      <section className="grid">
        <div className="card span3"><div className="label">Average bureau score</div><div className="value">{snapshot.metrics.averageScore ?? "—"}</div><div className="small">Demo data — no live bureau connection</div></div>
        <div className="card span3"><div className="label">Revolving utilization</div><div className="value">{snapshot.metrics.utilization}%</div><div className="progress"><div style={{width:`${Math.min(snapshot.metrics.utilization,100)}%`}} /></div></div>
        <div className="card span3"><div className="label">Open cases</div><div className="value">{snapshot.metrics.openCases}</div><div className="small">Each case is state-controlled and auditable</div></div>
        <div className="card span3"><div className="label">Production readiness</div><div className="value">{readiness.percent}%</div><div className="small">{readiness.ready}/{readiness.required} required control planes ready</div></div>

        <div className="card span4">
          <div className="row"><div><div className="label">Credit Digital Twin</div><h2>{demoProfile.name}</h2></div><span className="pill low">Demo snapshot</span></div>
          {demoProfile.scores.map((s) => <div className="scoreRow" key={s.bureau}><div><strong>{s.bureau}</strong><div className="small">Imported snapshot</div></div><div className="score">{s.score ?? "—"}</div></div>)}
          <div className="guardrail" style={{marginTop:14}}>Evidence coverage: <strong>{snapshot.metrics.evidenceCoverage}%</strong>. Missing evidence prevents dispute submission.</div>
        </div>

        <div className="card span8">
          <div className="row"><div><div className="label">Owner Attention Center</div><h2>Next-best-action queue</h2></div><span className="pill medium">Impact × evidence × controllability</span></div>
          {snapshot.attention.map((item, i) => <div className="finding" key={`${item.title}-${i}`}><div className="row"><h3>{item.title}</h3><span className={`pill ${item.priority === "P0" ? "high" : item.priority === "P1" ? "medium" : "low"}`}>{item.priority}</span></div><p>{item.reason}</p></div>)}
        </div>

        <div className="card span7">
          <div className="label">Case Operating System</div><h2>Evidence → policy → approval → action</h2>
          <div className="caseHeader"><span>Case</span><span>Status</span><span>Evidence</span></div>
          {snapshot.cases.map((c) => <div className="caseRow" key={c.id}><div><strong>{c.title}</strong><div className="small">{c.id}</div></div><span className={`pill ${c.status === "evidence_required" ? "high" : c.status === "ready_to_draft" ? "medium" : "low"}`}>{c.status.replaceAll("_", " ")}</span><strong>{c.evidenceIds.length}</strong></div>)}
        </div>

        <div className="card span5">
          <div className="label">Utilization Optimizer</div><h2>Cash-efficient plan</h2>
          <div className="row"><span className="small">Cash available</span><span className="money">${demoProfile.cashAvailable.toLocaleString()}</span></div>
          <div className="row" style={{marginTop:8}}><span className="small">Protected reserve</span><span className="money">${plan.reserve.toLocaleString()}</span></div>
          <div style={{marginTop:12}}>{plan.steps.map((s) => <div className="planStep" key={s.account}><div><strong>{s.account}</strong><div className="small">Target ≤ {s.targetUtilization}% utilization</div></div><div className="money">${s.pay.toLocaleString()}</div></div>)}</div>
          <div className="guardrail" style={{marginTop:14}}>Recommendation only. Payment execution remains blocked without explicit financial-action consent.</div>
        </div>

        <div className="card span7">
          <div className="label">Agentic Workforce</div><h2>ChatGPT AI Credit CEO + 8 specialized agents</h2>
          {agents.map((a) => <div className="agent" key={a.name}><span className={`agentState ${a.state}`} /><strong>{a.name}</strong><span className="small">{a.role}</span><span className="small">{a.metric}</span></div>)}
        </div>

        <div className="card span5">
          <div className="label">Production Readiness</div><h2>Fail-closed launch gate</h2>
          {readinessChecks.map((check) => <div className="readinessRow" key={check.id}><div><strong>{check.label}</strong><div className="small">{check.requiredForProduction ? "Required" : "Post-launch adapter"}</div></div><span className={`pill ${check.status === "ready" ? "low" : check.status === "setup" ? "medium" : "high"}`}>{check.status}</span></div>)}
        </div>

        <div className="card span12">
          <div className="row"><div><div className="label">Application Brain & Engine</div><h2>ChatGPT / OpenAI Responses API</h2></div><span className="pill low">Server-side · store=false</span></div>
          <div className="grid">
            <div className="span3"><strong>Reason</strong><div className="small">Interprets the Digital Twin and case state.</div></div>
            <div className="span3"><strong>Orchestrate</strong><div className="small">Prioritizes next-best-actions and specialist agents.</div></div>
            <div className="span3"><strong>Structured decisions</strong><div className="small">JSON-schema output instead of unbounded text.</div></div>
            <div className="span3"><strong>Cannot self-authorize</strong><div className="small">Every proposed sensitive action crosses the local policy gateway.</div></div>
          </div>
          <div className="guardrail" style={{marginTop:14}}>Endpoint: <strong>/api/chatgpt-brain</strong>. Without OPENAI_API_KEY, the system falls back to deterministic orchestration rather than failing open.</div>
        </div>

        <div className="card span12">
          <div className="label">Policy & Compliance Control Plane</div><h2>Non-bypassable action classes</h2>
          <div className="grid">
            <div className="span3"><strong>Read / Analyze / Rank</strong><div className="small">Autonomous</div></div>
            <div className="span3"><strong>Evidence-backed draft</strong><div className="small">Autonomous preparation</div></div>
            <div className="span3"><strong>Submit / Pay / New credit</strong><div className="small">Explicit approval required</div></div>
            <div className="span3"><strong>Fabricated evidence / false claims</strong><div className="small">Permanently blocked</div></div>
          </div>
        </div>
      </section>
      <footer>Advanced prototype • Demo-safe mode • External bureau, bank, creditor and furnisher actions are disabled until production controls and authorized integrations are complete.</footer>
    </main>
  );
}
