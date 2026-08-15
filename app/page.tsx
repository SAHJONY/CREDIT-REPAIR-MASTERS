import { demoEvidence, demoProfile } from "@/lib/demo";
import { buildBrainSnapshot } from "@/lib/orchestrator";
import { getReadinessChecks, readinessSummary } from "@/lib/readiness";
import { agentRegistry, agentRegistrySummary } from "@/lib/agent-registry";
import { evalSummary } from "@/lib/agent-evals";
import { defaultModelBudget } from "@/lib/model-budget";

const OS_VERSION = "1.8.0";

function configured(value: string | undefined) {
  return Boolean(value?.trim());
}

function runtimeState(value: boolean, readyLabel = "live") {
  return value ? readyLabel : "setup";
}

export default function Home() {
  const snapshot = buildBrainSnapshot(demoProfile, demoEvidence);
  const readinessChecks = getReadinessChecks();
  const readiness = readinessSummary(readinessChecks);
  const agentSummary = agentRegistrySummary();
  const evals = evalSummary();
  const plan = snapshot.paydownPlan;

  const openaiConfigured = configured(process.env.OPENAI_API_KEY);
  const databaseConfigured = configured(process.env.DATABASE_URL);
  const neonAuthConfigured = configured(process.env.NEON_AUTH_BASE_URL) || configured(process.env.VITE_NEON_AUTH_URL);
  const neonAuthSecretConfigured = configured(process.env.NEON_AUTH_COOKIE_SECRET) || configured(process.env.AUTH_SECRET);
  const sessionAuthConfigured = neonAuthConfigured && neonAuthSecretConfigured && databaseConfigured;
  const mfaEnforced = process.env.AUTH_MFA_ENFORCED === "true";
  const vaultConfigured = configured(process.env.BLOB_READ_WRITE_TOKEN);
  const providerConfigured = configured(process.env.CREDIT_DATA_PROVIDER) || configured(process.env.CREDIT_PROVIDER_API_KEY);
  const stateRulesConfigured = configured(process.env.STATE_RULES_VERSION) || configured(process.env.STATE_RULES_PROVIDER);
  const breakGlassConfigured = configured(process.env.CREDIT_OS_API_TOKEN);
  const missingRequired = readinessChecks.filter((check) => check.requiredForProduction && check.status !== "ready");

  return (
    <main>
      <header className="header">
        <div>
          <div className="kicker">CREDIT REPAIR MASTERS / OWNER COMMAND CENTER / v{OS_VERSION}</div>
          <h1>Agentic Credit Intelligence & Operations OS</h1>
          <p className="subtitle">A bounded-autonomy control plane for consumer and business credit: AI reasoning, evidence, durable workflows, policy enforcement, tenant-scoped persistence and operator security — with external execution deliberately separated from model authority.</p>
        </div>
        <div className="badge"><span className="dot" /> ChatGPT AI Credit CEO · controlled autonomy</div>
      </header>

      <section className="grid">
        <div className="card span3"><div className="label">Average bureau score</div><div className="value">{snapshot.metrics.averageScore ?? "—"}</div><div className="small">Demo Digital Twin · {providerConfigured ? "live provider configured, demo profile still displayed" : "no live bureau feed"}</div></div>
        <div className="card span3"><div className="label">Revolving utilization</div><div className="value">{snapshot.metrics.utilization}%</div><div className="small">Demo Digital Twin metric</div><div className="progress"><div style={{ width: `${Math.min(snapshot.metrics.utilization, 100)}%` }} /></div></div>
        <div className="card span3"><div className="label">AI safety evals</div><div className="value">{evals.percent}%</div><div className="small">{evals.passed}/{evals.total} deterministic controls passing</div></div>
        <div className="card span3"><div className="label">Agentic workforce</div><div className="value">{agentSummary.total}</div><div className="small">{agentSummary.autonomous} autonomous · {agentSummary.approvalRequired} approval-gated</div></div>

        <div className="card span8">
          <div className="row"><div><div className="label">Executive Control Plane</div><h2>Live system status & authority boundaries</h2></div><span className="pill high">External execution disabled</span></div>
          <div className="grid" style={{ marginTop: 14 }}>
            <div className="span3"><strong>OpenAI Brain</strong><div className="small">{runtimeState(openaiConfigured, "configured")} · Responses API · store=false</div></div>
            <div className="span3"><strong>Neon Data Plane</strong><div className="small">{runtimeState(databaseConfigured)} · tenant-scoped Postgres</div></div>
            <div className="span3"><strong>Neon Session Security</strong><div className="small">{runtimeState(sessionAuthConfigured)} · membership gate {sessionAuthConfigured ? "active" : "pending"}</div></div>
            <div className="span3"><strong>Private Evidence Vault</strong><div className="small">{runtimeState(vaultConfigured)} · private Blob only</div></div>
            <div className="span3"><strong>Privileged MFA</strong><div className="small">{mfaEnforced ? "enforced" : "setup"}</div></div>
            <div className="span3"><strong>Credit Data Provider</strong><div className="small">{providerConfigured ? "configured" : "setup"}</div></div>
            <div className="span3"><strong>State Rules Runtime</strong><div className="small">{stateRulesConfigured ? "configured" : "setup"}</div></div>
            <div className="span3"><strong>Break-glass Token</strong><div className="small">{breakGlassConfigured ? "configured" : "disabled"} · session auth remains primary</div></div>
          </div>
          <div className="guardrail" style={{ marginTop: 14 }}>Production principle: <strong>AI intelligence ≠ policy authority ≠ execution authority.</strong> No model output can directly submit a dispute, move money, open credit, or create an identity-theft allegation.</div>
        </div>

        <div className="card span4">
          <div className="label">Launch Control</div><h2>Fail-closed readiness</h2>
          <div className="value">{readiness.percent}%</div>
          <div className="small">{readiness.ready}/{readiness.required} required control planes verified by current runtime configuration</div>
          <div className="progress" style={{ marginTop: 12 }}><div style={{ width: `${readiness.percent}%` }} /></div>
          <div className="guardrail" style={{ marginTop: 14 }}>
            {readiness.productionReady
              ? "All required infrastructure gates report ready. Sensitive external actions remain separately approval-gated."
              : <>Remaining required gates: <strong>{missingRequired.map((check) => check.label).join(" · ")}</strong>.</>}
          </div>
        </div>

        <div className="card span4">
          <div className="row"><div><div className="label">Credit Digital Twin</div><h2>{demoProfile.name}</h2></div><span className="pill low">Demo data only</span></div>
          {demoProfile.scores.map((score) => <div className="scoreRow" key={score.bureau}><div><strong>{score.bureau}</strong><div className="small">Synthetic/imported demo snapshot</div></div><div className="score">{score.score ?? "—"}</div></div>)}
          <div className="guardrail" style={{ marginTop: 14 }}>Evidence coverage: <strong>{snapshot.metrics.evidenceCoverage}%</strong>. These scores and findings are demo data until an authorized live credit-data provider populates a real client profile.</div>
        </div>

        <div className="card span8">
          <div className="row"><div><div className="label">Owner Attention Center</div><h2>Demo next-best-action queue</h2></div><span className="pill medium">Impact × evidence × controllability</span></div>
          {snapshot.attention.map((item, index) => <div className="finding" key={`${item.title}-${index}`}><div className="row"><h3>{item.title}</h3><span className={`pill ${item.priority === "P0" ? "high" : item.priority === "P1" ? "medium" : "low"}`}>{item.priority}</span></div><p>{item.reason}</p></div>)}
        </div>

        <div className="card span7">
          <div className="label">Case Operating System</div><h2>Demo case flow · Evidence → policy → approval → controlled action</h2>
          <div className="caseHeader"><span>Case</span><span>Status</span><span>Evidence</span></div>
          {snapshot.cases.map((creditCase) => <div className="caseRow" key={creditCase.id}><div><strong>{creditCase.title}</strong><div className="small">{creditCase.id}</div></div><span className={`pill ${creditCase.status === "evidence_required" ? "high" : creditCase.status === "ready_to_draft" ? "medium" : "low"}`}>{creditCase.status.replaceAll("_", " ")}</span><strong>{creditCase.evidenceIds.length}</strong></div>)}
        </div>

        <div className="card span5">
          <div className="label">Utilization Optimizer</div><h2>Demo cash-efficient plan</h2>
          <div className="row"><span className="small">Cash available</span><span className="money">${demoProfile.cashAvailable.toLocaleString()}</span></div>
          <div className="row" style={{ marginTop: 8 }}><span className="small">Protected reserve</span><span className="money">${plan.reserve.toLocaleString()}</span></div>
          <div style={{ marginTop: 12 }}>{plan.steps.map((step) => <div className="planStep" key={step.account}><div><strong>{step.account}</strong><div className="small">Target ≤ {step.targetUtilization}% utilization</div></div><div className="money">${step.pay.toLocaleString()}</div></div>)}</div>
          <div className="guardrail" style={{ marginTop: 14 }}>Demo recommendation only. Payment execution remains approval-gated and externally disabled.</div>
        </div>

        <div className="card span8">
          <div className="row"><div><div className="label">Agentic Workforce</div><h2>{agentSummary.total} specialized agents under one Credit CEO</h2></div><span className="pill low">Bounded tools & risk ceilings</span></div>
          {agentRegistry.map((agent) => <div className="agent" key={agent.id}><span className={`agentState ${agent.authority === "autonomous" ? "active" : "watch"}`} /><strong>{agent.name}</strong><span className="small">{agent.riskCeiling} risk · {agent.maxToolCalls} max tools</span><span className="small">{agent.authority.replaceAll("_", " ")}</span></div>)}
        </div>

        <div className="card span4">
          <div className="label">Model Resource Governor</div><h2>Reasoning budget</h2>
          <div className="readinessRow"><strong>Model rounds</strong><span className="pill low">≤ {defaultModelBudget.maxModelRounds}</span></div>
          <div className="readinessRow"><strong>Tool calls</strong><span className="pill low">≤ {defaultModelBudget.maxToolCalls}</span></div>
          <div className="readinessRow"><strong>Prompt chars</strong><span className="pill low">≤ {defaultModelBudget.maxPromptChars.toLocaleString()}</span></div>
          <div className="readinessRow"><strong>Completion tokens</strong><span className="pill low">≤ {defaultModelBudget.maxCompletionTokens.toLocaleString()}</span></div>
          <div className="guardrail" style={{ marginTop: 14 }}>Budget violations stop agent escalation instead of silently increasing cost or tool depth.</div>
        </div>

        <div className="card span6">
          <div className="label">Agent Safety Evals</div><h2>Deterministic control verification</h2>
          {evals.results.map((result) => <div className="readinessRow" key={result.id}><div><strong>{result.id.replaceAll("-", " ")}</strong><div className="small">{result.detail}</div></div><span className={`pill ${result.passed ? "low" : "high"}`}>{result.passed ? "pass" : "fail"}</span></div>)}
        </div>

        <div className="card span6">
          <div className="label">Production Readiness</div><h2>Live infrastructure gates</h2>
          {readinessChecks.map((check) => <div className="readinessRow" key={check.id}><div><strong>{check.label}</strong><div className="small">{check.detail || (check.requiredForProduction ? "Required" : "Post-launch adapter")}</div></div><span className={`pill ${check.status === "ready" ? "low" : check.status === "setup" ? "medium" : "high"}`}>{check.status}</span></div>)}
        </div>

        <div className="card span12">
          <div className="row"><div><div className="label">Operational APIs</div><h2>AI, workflow, security and data-plane surfaces</h2></div><span className="pill medium">Business routes require Neon session + active membership</span></div>
          <div className="grid" style={{ marginTop: 14 }}>
            <div className="span3"><strong>/api/auth/get-session</strong><div className="small">Neon session runtime</div></div>
            <div className="span3"><strong>/api/clients</strong><div className="small">Tenant-scoped client operations</div></div>
            <div className="span3"><strong>/api/evidence/upload</strong><div className="small">Private evidence vault intake</div></div>
            <div className="span3"><strong>/api/chatgpt-brain</strong><div className="small">AI Credit CEO orchestration</div></div>
            <div className="span3"><strong>/api/agent-router</strong><div className="small">Risk-aware specialist routing</div></div>
            <div className="span3"><strong>/api/workflows/credit-case</strong><div className="small">Durable start + approval wait</div></div>
            <div className="span3"><strong>/api/storage-health</strong><div className="small">Neon connectivity + schema readiness</div></div>
            <div className="span3"><strong>/api/security-status</strong><div className="small">Session, membership, MFA and break-glass boundary</div></div>
            <div className="span3"><strong>/api/platform-status</strong><div className="small">Multi-tenant persistence state</div></div>
            <div className="span3"><strong>/api/readiness</strong><div className="small">Runtime fail-closed launch gate</div></div>
          </div>
        </div>
      </section>
      <footer>CREDIT REPAIR MASTERS OS v{OS_VERSION} • Live infrastructure status + explicit demo credit data • Controlled autonomy • Evidence-first • No guaranteed score outcomes • External sensitive execution disabled until verified production gates are satisfied.</footer>
    </main>
  );
}
