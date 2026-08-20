import Link from 'next/link';
import type { Route } from 'next';
import { redirect } from 'next/navigation';
import { SignOutButton } from '@/components/sign-out-button';
import { isDemoClient } from '@/lib/demo-fixtures';
import { getBusinessSession } from '@/lib/session-access';
import { getPlatformStore } from '@/lib/platform-store';
import { resolveProductionReadiness } from '@/lib/production-readiness';

export const dynamic = 'force-dynamic';

type ModuleCard = {
  label: string;
  title: string;
  detail: string;
  href: Route;
  cta: string;
};

const modules: ModuleCard[] = [
  { label: 'CUSTOMERS', title: 'Client Operations', detail: 'Intake, onboarding, readiness plans, progress, cases and customer lifecycle.', href: '/clients', cta: 'Open clients' },
  { label: 'READINESS', title: 'Readiness Engine', detail: 'Goal-specific scoring, blocker analysis, 7/30/60/90-day plans and Ready-to-Shop gates.', href: '/loan-readiness', cta: 'Open readiness' },
  { label: 'MARKETPLACE', title: 'Partner Marketplace', detail: 'Partner eligibility, consented handoffs, outcome attribution and marketplace revenue.', href: '/owner/marketplace', cta: 'Open marketplace' },
  { label: 'EVIDENCE', title: 'Document Vault', detail: 'Customer evidence, authorizations, reports, supporting documents and governed records.', href: '/documents', cta: 'Open documents' },
  { label: 'REVENUE', title: 'Billing & Offers', detail: 'Commercial services, invoice eligibility, settlement controls and revenue operations.', href: '/billing', cta: 'Open billing' },
  { label: 'GROWTH', title: 'Growth OS', detail: 'Lead flow, conversion pathways, offer entry points and measurable acquisition operations.', href: '/growth', cta: 'Open growth' },
  { label: 'RISK', title: 'Compliance Center', detail: 'Consent, disclosures, policy guardrails, audit evidence and regulated-workflow controls.', href: '/compliance', cta: 'Open compliance' },
  { label: 'SYSTEM', title: 'Launch Control', detail: 'Production gates, environment readiness and fail-closed release requirements.', href: '/launch', cta: 'Open launch' },
  { label: 'WORKFORCE', title: 'AI Operations', detail: 'Governed agent execution, model activity, tool calls and operational traceability.', href: '/dashboard', cta: 'Open operations' }
];

export default async function OwnerPage() {
  const session = await getBusinessSession();
  if (!session) redirect('/auth/sign-in');
  if (session.member.role !== 'owner') redirect('/dashboard');
  if (session.mfaRequired && !session.mfaAssured) redirect('/auth/mfa');

  const store = getPlatformStore();
  const [organization, clients, users, audit, runs, productionReadiness] = await Promise.all([
    store.getOrganization(session.organizationId),
    store.listClients(session.organizationId),
    store.listUsers(session.organizationId),
    store.listAudit(session.organizationId, 10),
    store.listAgentRuns(session.organizationId, 10),
    resolveProductionReadiness(session.organizationId)
  ]);

  const checks = productionReadiness.checks;
  const readiness = productionReadiness.summary;
  const realClients = clients.filter((client) => !isDemoClient(client));
  const demoClients = clients.filter(isDemoClient);
  const activeClients = realClients.filter((client) => client.status === 'active').length;
  const onboarding = realClients.filter((client) => client.status === 'onboarding').length;
  const activeUsers = users.filter((user) => user.status === 'active').length;
  const openGates = checks.filter((check) => check.requiredForProduction && check.status !== 'ready');
  const blockedEvents = audit.filter((item) => item.decision === 'blocked').length;
  const failedRuns = runs.filter((run) => run.status === 'failed').length;
  const ownerHealth = Math.max(0, 100 - openGates.length * 8 - blockedEvents * 2 - failedRuns * 3);

  return (
    <main>
      <header className="ownerHero">
        <div>
          <div className="kicker">NEW850 OWNER OS / {organization?.name || 'NEW850.COM'} / CONTROL PLANE</div>
          <h1>New850 Owner Command Center</h1>
          <p className="subtitle">Control customers, readiness, Financial Passport, marketplace partners, handoffs, outcomes, revenue, compliance, growth, AI operations and production release gates.</p>
        </div>
        <div className="ownerNav">
          <Link className="primaryButton" href="/loan-readiness">Readiness</Link>
          <Link className="secondaryButton" href="/owner/marketplace">Marketplace</Link>
          <Link className="secondaryButton" href="/clients">Clients</Link>
          <Link className="secondaryButton" href="/billing">Revenue</Link>
          <Link className="secondaryButton" href="/launch">Launch</Link>
          <SignOutButton />
        </div>
      </header>

      <section className="ownerKpiGrid">
        <div className="ownerKpi"><span>OWNER HEALTH</span><strong>{ownerHealth}%</strong><small>derived from gates, blocked events and failed runs</small></div>
        <div className="ownerKpi"><span>REAL CLIENTS</span><strong>{realClients.length}</strong><small>{activeClients} active · {onboarding} onboarding</small></div>
        <div className="ownerKpi"><span>PRODUCTION READINESS</span><strong>{readiness.percent}%</strong><small>{readiness.ready}/{readiness.required} required controls</small></div>
        <div className="ownerKpi"><span>ACTIVE TEAM</span><strong>{activeUsers}</strong><small>owner + authorized operating users</small></div>
      </section>

      <section className="ownerActionStrip">
        <div className="ownerActionCard">
          <div className="label">OWNER PRIORITY</div>
          <h2>{openGates.length ? `Close ${openGates.length} production gate${openGates.length === 1 ? '' : 's'}` : 'Scale the readiness-to-marketplace business loop'}</h2>
          <p>{openGates.length ? 'Required production controls remain open. Keep the system fail-closed until these controls are ready.' : 'Production controls are ready. Focus on real lead acquisition, measurable customer readiness, consented marketplace handoffs, verified outcomes and compliant recurring revenue.'}</p>
          <div className="headerActions">
            <Link className="primaryButton" href={openGates.length ? '/launch' : '/growth'}>{openGates.length ? 'Resolve launch gates' : 'Open growth OS'}</Link>
            <Link className="secondaryButton" href="/owner/marketplace">Marketplace control</Link>
            <Link className="secondaryButton" href="/billing">Revenue control</Link>
            <Link className="secondaryButton" href="/compliance">Compliance control</Link>
          </div>
        </div>
        <div className="ownerActionCard">
          <div className="label">CONTROL SIGNALS</div>
          <div className="ownerQuickLinks">
            <Link href="/clients">{realClients.length} real clients</Link>
            <Link href="/launch">{openGates.length} open production gates</Link>
            <Link href="/owner/marketplace">Marketplace partner + outcome ledger</Link>
            <Link href="/dashboard">{runs.length} recent governed agent runs</Link>
            <Link href="/compliance">{blockedEvents} recent blocked audit events</Link>
            <Link href="/documents">{demoClients.length} demo fixtures excluded from KPIs</Link>
          </div>
        </div>
      </section>

      <section className="grid">
        <div className="card span12">
          <div className="label">ENTIRE OPERATING SYSTEM</div>
          <h2>Control every New850.com business function from one owner surface.</h2>
          <div className="grid">
            {modules.map((module) => (
              <div className="card span3" key={module.title}>
                <div className="label">{module.label}</div>
                <h3>{module.title}</h3>
                <p className="small">{module.detail}</p>
                <Link className="secondaryButton" href={module.href}>{module.cta}</Link>
              </div>
            ))}
          </div>
        </div>

        <div className="card span7">
          <div className="row">
            <div><div className="label">CLIENT PIPELINE</div><h2>Owner client view</h2></div>
            <Link className="primaryButton" href="/clients">Manage clients</Link>
          </div>
          {realClients.length ? realClients.slice(0, 8).map((client) => (
            <Link className="listRow" href={`/clients/${client.id}`} key={client.id}>
              <div><strong>{client.displayName}</strong><div className="small">{client.kind} · {client.state}</div></div>
              <span className="pill low">{client.status}</span>
            </Link>
          )) : <div className="emptyState">No real client records yet. Start with lead conversion and client onboarding.</div>}
        </div>

        <div className="card span5">
          <div className="label">PRODUCTION CONTROL</div>
          <h2>{openGates.length ? 'Owner attention required' : 'Required controls ready'}</h2>
          {openGates.map((check) => (
            <div className="readinessRow" key={check.id}>
              <div><strong>{check.label}</strong><div className="small">{check.detail}</div></div>
              <span className="pill medium">{check.status}</span>
            </div>
          ))}
          {!openGates.length ? <div className="emptyState">All required production controls are ready.</div> : null}
        </div>

        <div className="card span6">
          <div className="label">AUDIT & RISK</div>
          <h2>Latest governed activity</h2>
          {audit.length ? audit.map((item) => (
            <div className="listRow" key={item.id}>
              <div><strong>{item.action.replaceAll('_', ' ')}</strong><div className="small">{item.actorId} · {new Date(item.createdAt).toLocaleString()}</div></div>
              <span className={`pill ${item.decision === 'blocked' ? 'high' : item.decision === 'approval_required' ? 'medium' : 'low'}`}>{item.decision || 'logged'}</span>
            </div>
          )) : <div className="emptyState">No audit events yet.</div>}
        </div>

        <div className="card span6">
          <div className="label">AI WORKFORCE</div>
          <h2>Recent governed runs</h2>
          {runs.length ? runs.map((run) => (
            <div className="listRow" key={run.id}>
              <div><strong>{run.agent}</strong><div className="small">{run.model || 'model not recorded'} · {run.toolCalls} tools</div></div>
              <span className={`pill ${run.status === 'failed' ? 'high' : run.status === 'fallback' ? 'medium' : 'low'}`}>{run.status}</span>
            </div>
          )) : <div className="emptyState">No agent runs recorded yet.</div>}
        </div>

        <div className="card span12">
          <div className="row">
            <div>
              <div className="label">OWNER GOVERNANCE</div>
              <h2>Private, MFA-protected, fail-closed New850.com control plane.</h2>
              <div className="small">Signed in as {session.email} · owner role verified · MFA assured. Customer readiness is planning support, marketplace routing requires consent, and partner outcomes remain separate from lender underwriting.</div>
            </div>
            <Link className="secondaryButton" href="/dashboard">Staff dashboard</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
