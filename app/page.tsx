import { getReadinessChecks, readinessSummary } from "@/lib/readiness";
import { agentRegistry, agentRegistrySummary } from "@/lib/agent-registry";
import { evalSummary } from "@/lib/agent-evals";
import { defaultModelBudget } from "@/lib/model-budget";
import { configuredOrganizationId } from "@/lib/api-auth";
import { getNeonAuth, neonAuthConfigured } from "@/lib/auth/server";
import { getPlatformStore, storageMode } from "@/lib/platform-store";

const OS_VERSION = "1.9.0";

function configured(value: string | undefined) {
  return Boolean(value?.trim());
}

function sessionIdentity(data: unknown): { id: string; email: string } | null {
  if (!data || typeof data !== "object") return null;
  const wrapper = data as { data?: unknown; user?: unknown };
  const source = wrapper.data && typeof wrapper.data === "object" ? wrapper.data : data;
  const candidate = source as { user?: unknown };
  if (!candidate.user || typeof candidate.user !== "object") return null;
  const user = candidate.user as { id?: unknown; email?: unknown };
  if (typeof user.id !== "string" || typeof user.email !== "string") return null;
  const id = user.id.trim();
  const email = user.email.trim().toLowerCase();
  return id && email ? { id, email } : null;
}

function compactTime(value: string | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

export default async function Home() {
  const readinessChecks = getReadinessChecks();
  const readiness = readinessSummary(readinessChecks);
  const missingRequired = readinessChecks.filter((check) => check.requiredForProduction && check.status !== "ready");
  const agentSummary = agentRegistrySummary();
  const evals = evalSummary();
  const organizationId = configuredOrganizationId();
  const databaseMode = storageMode();

  const openaiConfigured = configured(process.env.OPENAI_API_KEY);
  const providerConfigured = configured(process.env.CREDIT_DATA_PROVIDER) || configured(process.env.CREDIT_PROVIDER_API_KEY);
  const vaultConfigured = configured(process.env.BLOB_READ_WRITE_TOKEN);
  const stateRulesConfigured = configured(process.env.STATE_RULES_VERSION) || configured(process.env.STATE_RULES_PROVIDER);
  const mfaEnforced = process.env.AUTH_MFA_ENFORCED === "true";
  const breakGlassConfigured = configured(process.env.CREDIT_OS_API_TOKEN);

  let identity: { id: string; email: string } | null = null;
  let member: Awaited<ReturnType<ReturnType<typeof getPlatformStore>["listUsers"]>>[number] | null = null;
  let organization: Awaited<ReturnType<ReturnType<typeof getPlatformStore>["getOrganization"]>> = null;
  let users: Awaited<ReturnType<ReturnType<typeof getPlatformStore>["listUsers"]>> = [];
  let clients: Awaited<ReturnType<ReturnType<typeof getPlatformStore>["listClients"]>> = [];
  let audit: Awaited<ReturnType<ReturnType<typeof getPlatformStore>["listAudit"]>> = [];
  let agentRuns: Awaited<ReturnType<ReturnType<typeof getPlatformStore>["listAgentRuns"]>> = [];
  let evidenceCount = 0;
  let verifiedEvidenceCount = 0;
  let activeConsentCount = 0;
  let dataError: string | null = null;

  if (neonAuthConfigured()) {
    try {
      identity = sessionIdentity(await getNeonAuth().getSession());
    } catch {
      dataError = "AUTH_SESSION_UNAVAILABLE";
    }
  }

  if (identity) {
    try {
      const store = getPlatformStore();
      users = await store.listUsers(organizationId);
      member = users.find((user) => user.status === "active" && user.email.trim().toLowerCase() === identity?.email) ?? null;

      if (member) {
        [organization, clients, audit, agentRuns] = await Promise.all([
          store.getOrganization(organizationId),
          store.listClients(organizationId),
          store.listAudit(organizationId, 20),
          store.listAgentRuns(organizationId, 20)
        ]);

        const perClient = await Promise.all(clients.map(async (client) => {
          const [evidence, consents] = await Promise.all([
            store.listEvidence(organizationId, client.id),
            store.listConsents(organizationId, client.id)
          ]);
          return { evidence, consents };
        }));

        evidenceCount = perClient.reduce((sum, item) => sum + item.evidence.length, 0);
        verifiedEvidenceCount = perClient.reduce((sum, item) => sum + item.evidence.filter((record) => record.verification === "verified").length, 0);
        activeConsentCount = perClient.reduce((sum, item) => sum + item.consents.filter((record) => record.granted && !record.revokedAt).length, 0);
      }
    } catch (error) {
      dataError = error instanceof Error ? error.message : "LIVE_DATA_UNAVAILABLE";
    }
  }

  const activeUsers = users.filter((user) => user.status === "active").length;
  const activeClients = clients.filter((client) => client.status === "active").length;
  const onboardingClients = clients.filter((client) => client.status === "onboarding").length;
  const completedAgentRuns = agentRuns.filter((run) => run.status === "completed").length;
  const failedAgentRuns = agentRuns.filter((run) => run.status === "failed").length;

  return (
    <main>
      <header className="header">
        <div>
          <div className="kicker">CREDIT REPAIR MASTERS / OWNER COMMAND CENTER / v{OS_VERSION}</div>
          <h1>Live Credit Intelligence & Operations OS</h1>
          <p className="subtitle">Real tenant-scoped operations from Neon. No synthetic bureau score, utilization, client, case or evidence data is displayed on this command center.</p>
        </div>
        <div className="badge"><span className="dot" /> {identity && member ? `${member.role} · authenticated` : "live system · secure access"}</div>
      </header>

      <section className="grid">
        <div className="card span3"><div className="label">Production readiness</div><div className="value">{readiness.percent}%</div><div className="small">{readiness.ready}/{readiness.required} required controls ready</div></div>
        <div className="card span3"><div className="label">Live clients</div><div className="value">{member ? clients.length : "—"}</div><div className="small">{member ? `${activeClients} active · ${onboardingClients} onboarding` : "authenticated membership required"}</div></div>
        <div className="card span3"><div className="label">Evidence records</div><div className="value">{member ? evidenceCount : "—"}</div><div className="small">{member ? `${verifiedEvidenceCount} verified · ${evidenceCount - verifiedEvidenceCount} pending/rejected` : "private tenant data"}</div></div>
        <div className="card span3"><div className="label">AI safety evals</div><div className="value">{evals.percent}%</div><div className="small">{evals.passed}/{evals.total} deterministic controls passing</div></div>

        <div className="card span8">
          <div className="row"><div><div className="label">Executive Control Plane</div><h2>Real runtime status</h2></div><span className="pill high">External execution disabled</span></div>
          <div className="grid" style={{ marginTop: 14 }}>
            <div className="span3"><strong>Organization</strong><div className="small">{organization?.name ?? organizationId}</div></div>
            <div className="span3"><strong>Neon Data Plane</strong><div className="small">{databaseMode} · {databaseMode === "neon-postgres" ? "live" : "not live"}</div></div>
            <div className="span3"><strong>Neon Auth</strong><div className="small">{neonAuthConfigured() ? "configured" : "setup"} · membership gate</div></div>
            <div className="span3"><strong>OpenAI Brain</strong><div className="small">{openaiConfigured ? "configured" : "setup"} · store=false</div></div>
            <div className="span3"><strong>Private Evidence Vault</strong><div className="small">{vaultConfigured ? "configured" : "setup"}</div></div>
            <div className="span3"><strong>Privileged MFA</strong><div className="small">{mfaEnforced ? "enforced" : "setup"}</div></div>
            <div className="span3"><strong>Credit Data Provider</strong><div className="small">{providerConfigured ? "configured" : "not connected"}</div></div>
            <div className="span3"><strong>State Rules Runtime</strong><div className="small">{stateRulesConfigured ? "configured" : "setup"}</div></div>
          </div>
          <div className="guardrail" style={{ marginTop: 14 }}>AI intelligence ≠ policy authority ≠ execution authority. Dispute submission, payments, new credit and identity-theft workflows remain approval-gated.</div>
        </div>

        <div className="card span4">
          <div className="label">Launch Control</div><h2>Fail-closed readiness</h2>
          <div className="value">{readiness.percent}%</div>
          <div className="progress" style={{ marginTop: 12 }}><div style={{ width: `${readiness.percent}%` }} /></div>
          <div className="guardrail" style={{ marginTop: 14 }}>{readiness.productionReady ? "All required infrastructure controls report ready." : <>Remaining gates: <strong>{missingRequired.map((check) => check.label).join(" · ")}</strong>.</>}</div>
        </div>

        {!identity && (
          <div className="card span12">
            <div className="label">Secure Owner Access</div><h2>Neon session required for tenant data</h2>
            <p>The system is live, but client names, consent records, evidence, audit events and agent history are intentionally hidden until an authenticated Neon user matches an active organization member.</p>
            <div className="guardrail">No demo replacement is shown. Authenticate with one of the active owner accounts to display the real operating dataset.</div>
          </div>
        )}

        {identity && !member && (
          <div className="card span12">
            <div className="label">Access Denied</div><h2>Authenticated account is not an active organization member</h2>
            <p>{identity.email}</p>
            <div className="guardrail">Authentication alone does not grant access. Membership must exist in {organizationId}.</div>
          </div>
        )}

        {dataError && <div className="card span12"><div className="label">Live Data Error</div><h2>{dataError}</h2><div className="guardrail">The dashboard fails closed rather than substituting demo records.</div></div>}

        {member && (
          <>
            <div className="card span4">
              <div className="label">Tenant Operations</div><h2>{organization?.name ?? "CREDIT REPAIR MASTERS"}</h2>
              <div className="readinessRow"><strong>Active staff</strong><span className="pill low">{activeUsers}</span></div>
              <div className="readinessRow"><strong>Clients</strong><span className="pill low">{clients.length}</span></div>
              <div className="readinessRow"><strong>Active consents</strong><span className="pill low">{activeConsentCount}</span></div>
              <div className="readinessRow"><strong>Audit events loaded</strong><span className="pill low">{audit.length}</span></div>
              <div className="readinessRow"><strong>Agent runs loaded</strong><span className="pill low">{agentRuns.length}</span></div>
              <div className="small" style={{ marginTop: 12 }}>Signed in as {identity?.email} · {member.role}</div>
            </div>

            <div className="card span8">
              <div className="row"><div><div className="label">Live Client Registry</div><h2>Real Neon client records</h2></div><span className="pill low">tenant scoped</span></div>
              {clients.length === 0 ? <div className="guardrail" style={{ marginTop: 14 }}>No real clients have been onboarded yet.</div> : clients.map((client) => (
                <div className="finding" key={client.id}>
                  <div className="row"><div><h3>{client.displayName}</h3><div className="small">{client.id} · {client.kind} · {client.state}</div></div><span className={`pill ${client.status === "active" ? "low" : client.status === "onboarding" ? "medium" : "high"}`}>{client.status}</span></div>
                  <p>Created {compactTime(client.createdAt)} · Updated {compactTime(client.updatedAt)}</p>
                </div>
              ))}
            </div>

            <div className="card span6">
              <div className="label">Audit Ledger</div><h2>Latest real control-plane events</h2>
              {audit.length === 0 ? <div className="guardrail">No audit events recorded yet.</div> : audit.map((event) => (
                <div className="readinessRow" key={event.id}><div><strong>{event.action}</strong><div className="small">{event.actorType}:{event.actorId} · {event.resourceType}:{event.resourceId} · {compactTime(event.createdAt)}</div></div><span className={`pill ${event.decision === "blocked" ? "high" : event.decision === "approval_required" ? "medium" : "low"}`}>{event.decision ?? "recorded"}</span></div>
              ))}
            </div>

            <div className="card span6">
              <div className="row"><div><div className="label">Agent Operations</div><h2>Latest real agent runs</h2></div><span className={`pill ${failedAgentRuns ? "high" : "low"}`}>{completedAgentRuns} complete · {failedAgentRuns} failed</span></div>
              {agentRuns.length === 0 ? <div className="guardrail" style={{ marginTop: 14 }}>No agent runs have been persisted yet.</div> : agentRuns.map((run) => (
                <div className="readinessRow" key={run.id}><div><strong>{run.agent}</strong><div className="small">{run.model ?? "model not recorded"} · {run.toolCalls} tools · {compactTime(run.createdAt)}</div></div><span className={`pill ${run.status === "failed" ? "high" : run.status === "fallback" ? "medium" : "low"}`}>{run.status}</span></div>
              ))}
            </div>
          </>
        )}

        <div className="card span4">
          <div className="label">Live Credit Data</div><h2>Bureau intelligence</h2>
          <div className="value">—</div>
          <div className="small">{providerConfigured ? "Provider configured; no bureau profile is persisted in the current platform schema." : "No authorized live credit-data provider connected."}</div>
          <div className="guardrail" style={{ marginTop: 14 }}>No score, utilization or derogatory-account value is fabricated when live bureau data is unavailable.</div>
        </div>

        <div className="card span8">
          <div className="row"><div><div className="label">Agentic Workforce</div><h2>{agentSummary.total} configured specialists</h2></div><span className="pill low">{agentSummary.autonomous} autonomous · {agentSummary.approvalRequired} gated</span></div>
          {agentRegistry.map((agent) => <div className="agent" key={agent.id}><span className={`agentState ${agent.authority === "autonomous" ? "active" : "watch"}`} /><strong>{agent.name}</strong><span className="small">{agent.riskCeiling} risk · {agent.maxToolCalls} max tools</span><span className="small">{agent.authority.replaceAll("_", " ")}</span></div>)}
        </div>

        <div className="card span4">
          <div className="label">Model Resource Governor</div><h2>Reasoning budget</h2>
          <div className="readinessRow"><strong>Model rounds</strong><span className="pill low">≤ {defaultModelBudget.maxModelRounds}</span></div>
          <div className="readinessRow"><strong>Tool calls</strong><span className="pill low">≤ {defaultModelBudget.maxToolCalls}</span></div>
          <div className="readinessRow"><strong>Prompt chars</strong><span className="pill low">≤ {defaultModelBudget.maxPromptChars.toLocaleString()}</span></div>
          <div className="readinessRow"><strong>Completion tokens</strong><span className="pill low">≤ {defaultModelBudget.maxCompletionTokens.toLocaleString()}</span></div>
        </div>

        <div className="card span8">
          <div className="label">Production Readiness</div><h2>Current infrastructure gates</h2>
          {readinessChecks.map((check) => <div className="readinessRow" key={check.id}><div><strong>{check.label}</strong><div className="small">{check.detail || (check.requiredForProduction ? "Required" : "Post-launch")}</div></div><span className={`pill ${check.status === "ready" ? "low" : check.status === "setup" ? "medium" : "high"}`}>{check.status}</span></div>)}
        </div>

        <div className="card span12">
          <div className="row"><div><div className="label">Operational APIs</div><h2>Live system surfaces</h2></div><span className="pill medium">Neon session + active membership</span></div>
          <div className="grid" style={{ marginTop: 14 }}>
            <div className="span3"><strong>/api/auth/get-session</strong><div className="small">Neon session runtime</div></div>
            <div className="span3"><strong>/api/clients</strong><div className="small">Real tenant client operations</div></div>
            <div className="span3"><strong>/api/evidence/upload</strong><div className="small">Private evidence intake</div></div>
            <div className="span3"><strong>/api/storage-health</strong><div className="small">Neon persistence health</div></div>
            <div className="span3"><strong>/api/readiness</strong><div className="small">Fail-closed launch gate</div></div>
            <div className="span3"><strong>/api/security-status</strong><div className="small">Auth and MFA boundary</div></div>
            <div className="span3"><strong>/api/chatgpt-brain</strong><div className="small">AI Credit CEO</div></div>
            <div className="span3"><strong>/api/workflows/credit-case</strong><div className="small">Durable case workflow</div></div>
          </div>
        </div>
      </section>
      <footer>CREDIT REPAIR MASTERS OS v{OS_VERSION} • REAL DATA ONLY • Tenant-scoped Neon operations • No synthetic credit metrics • External sensitive execution remains approval-gated. {breakGlassConfigured ? "Break-glass token configured." : "Break-glass token disabled."}</footer>
    </main>
  );
}
