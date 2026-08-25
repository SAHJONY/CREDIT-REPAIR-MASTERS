import Link from 'next/link';
import type { Route } from 'next';
import { redirect } from 'next/navigation';
import { SignOutButton } from '@/components/sign-out-button';
import { isDemoClient } from '@/lib/demo-fixtures';
import { listGrowthLeads } from '@/lib/growth-lead-store';
import { getBusinessSession } from '@/lib/session-access';
import { getPlatformStore } from '@/lib/platform-store';
import { resolveProductionReadiness } from '@/lib/production-readiness';

export const dynamic = 'force-dynamic';

type BusinessArea = {
  step: string;
  label: string;
  title: string;
  detail: string;
  href: Route;
  cta: string;
};

const businessAreas: BusinessArea[] = [
  { step: '01', label: 'ACQUIRE', title: 'Lead Inbox', detail: 'New qualification requests, contact details, source and requested financial goal.', href: '/growth/leads', cta: 'Open lead inbox' },
  { step: '02', label: 'ONBOARD', title: 'Clients', detail: 'Convert qualified prospects into managed client records and portal access.', href: '/clients', cta: 'Manage clients' },
  { step: '03', label: 'ASSESS', title: 'Readiness', detail: 'Financial Passport, readiness score, blockers, plans and Ready-to-Shop gates.', href: '/owner/readiness', cta: 'Open readiness' },
  { step: '04', label: 'EXECUTE', title: 'Documents & Letters', detail: 'Evidence, client authorizations, signed letters, printing and bureau mail workflow.', href: '/documents', cta: 'Open documents' },
  { step: '05', label: 'MONETIZE', title: 'Billing & Revenue', detail: 'Invoices, completed-service billing controls and revenue operations.', href: '/billing', cta: 'Open billing' },
  { step: '06', label: 'MATCH', title: 'Marketplace', detail: 'Consent-governed partner matching, handoffs and outcome attribution.', href: '/owner/marketplace', cta: 'Open marketplace' },
  { step: '07', label: 'GOVERN', title: 'Compliance', detail: 'Consent, disclosures, audit evidence, policy controls and regulated workflow review.', href: '/compliance', cta: 'Open compliance' },
  { step: '08', label: 'GROW', title: 'Growth', detail: 'Funnel performance, acquisition channels and conversion operations.', href: '/growth', cta: 'Open growth' },
  { step: '09', label: 'OPERATE', title: 'System Operations', detail: 'AI runs, technical operations, launch gates and production health.', href: '/dashboard', cta: 'Open operations' }
];

export default async function OwnerPage() {
  const session = await getBusinessSession();
  if (!session) redirect('/auth/sign-in');
  if (session.member.role !== 'owner') redirect('/dashboard');
  if (session.mfaRequired && !session.mfaAssured) redirect('/auth/mfa');

  const store = getPlatformStore();
  const [organization, clients, users, audit, runs, productionReadiness, leads] = await Promise.all([
    store.getOrganization(session.organizationId),
    store.listClients(session.organizationId),
    store.listUsers(session.organizationId),
    store.listAudit(session.organizationId, 10),
    store.listAgentRuns(session.organizationId, 10),
    resolveProductionReadiness(session.organizationId),
    listGrowthLeads(session.organizationId, 100)
  ]);

  const realLeads = leads.filter((lead) => !lead.isTest);
  const newLeads = realLeads.filter((lead) => lead.status === 'new');
  const realClients = clients.filter((client) => !isDemoClient(client));
  const activeClients = realClients.filter((client) => client.status === 'active').length;
  const onboarding = realClients.filter((client) => client.status === 'onboarding').length;
  const activeUsers = users.filter((user) => user.status === 'active').length;
  const checks = productionReadiness.checks;
  const readiness = productionReadiness.summary;
  const openGates = checks.filter((check) => check.requiredForProduction && check.status !== 'ready');
  const blockedEvents = audit.filter((item) => item.decision === 'blocked').length;
  const failedRuns = runs.filter((run) => run.status === 'failed').length;
  const ownerHealth = Math.max(0, 100 - openGates.length * 8 - blockedEvents * 2 - failedRuns * 3);

  return (
    <main>
      <header className="ownerHero">
        <div>
          <div className="kicker">NEW850 OWNER OS / {organization?.name || 'NEW850.COM'} / BUSINESS COMMAND CENTER</div>
          <h1>Run the business from one place.</h1>
          <p className="subtitle">Start with what needs attention today, then move each customer through one consistent operating flow: lead → client → readiness → documents → billing → marketplace → follow-up.</p>
        </div>
        <div className="ownerNav">
          <Link className="primaryButton" href="/growth/leads">Lead Inbox{newLeads.length ? ` (${newLeads.length})` : ''}</Link>
          <Link className="secondaryButton" href="/clients">Clients</Link>
          <Link className="secondaryButton" href="/documents">Letters</Link>
          <Link className="secondaryButton" href="/billing">Billing</Link>
          <SignOutButton />
        </div>
      </header>

      <section className="ownerKpiGrid">
        <div className="ownerKpi"><span>NEW LEADS</span><strong>{newLeads.length}</strong><small>{realLeads.length} total real leads</small></div>
        <div className="ownerKpi"><span>CLIENTS</span><strong>{realClients.length}</strong><small>{activeClients} active · {onboarding} onboarding</small></div>
        <div className="ownerKpi"><span>BUSINESS HEALTH</span><strong>{ownerHealth}%</strong><small>operations, risk and production signals</small></div>
        <div className="ownerKpi"><span>PRODUCTION</span><strong>{readiness.percent}%</strong><small>{readiness.ready}/{readiness.required} required controls</small></div>
      </section>

      <section className="ownerActionStrip">
        <div className="ownerActionCard">
          <div className="label">DO THIS NEXT</div>
          <h2>{newLeads.length ? `Review ${newLeads.length} new qualification request${newLeads.length === 1 ? '' : 's'}` : openGates.length ? `Resolve ${openGates.length} production gate${openGates.length === 1 ? '' : 's'}` : 'Move active clients to their next milestone'}</h2>
          <p>{newLeads.length ? 'New demand is waiting in the Lead Inbox. Review the request, contact the prospect, qualify the need and convert the right prospect into a client.' : openGates.length ? 'Required production controls remain open. Keep affected workflows fail-closed until the controls are ready.' : 'No new lead is waiting. Focus on readiness work, client documents, completed-service billing and consented marketplace handoffs.'}</p>
          <div className="headerActions">
            <Link className="primaryButton" href={newLeads.length ? '/growth/leads' : openGates.length ? '/launch' : '/clients'}>{newLeads.length ? 'Open lead inbox' : openGates.length ? 'Open launch control' : 'Open clients'}</Link>
            <Link className="secondaryButton" href="/documents">Letters & documents</Link>
            <Link className="secondaryButton" href="/compliance">Compliance</Link>
          </div>
        </div>
        <div className="ownerActionCard">
          <div className="label">TODAY AT A GLANCE</div>
          <div className="ownerQuickLinks">
            <Link href="/growth/leads">{newLeads.length} new leads</Link>
            <Link href="/clients">{onboarding} clients onboarding</Link>
            <Link href="/owner/readiness">Readiness workbench</Link>
            <Link href="/documents">Letters, signatures & bureau mail</Link>
            <Link href="/billing">Billing & revenue</Link>
            <Link href="/compliance">{blockedEvents} recent blocked audit events</Link>
          </div>
        </div>
      </section>

      <section className="grid">
        <div className="card span12">
          <div className="label">BUSINESS WORKFLOW</div>
          <h2>Everything is organized in the order the business operates.</h2>
          <div className="grid">
            {businessAreas.map((area) => (
              <div className="card span4" key={area.title}>
                <div className="label">{area.step} · {area.label}</div>
                <h3>{area.title}</h3>
                <p className="small">{area.detail}</p>
                <Link className="secondaryButton" href={area.href}>{area.cta}</Link>
              </div>
            ))}
          </div>
        </div>

        <div className="card span7">
          <div className="row">
            <div><div className="label">LATEST LEADS</div><h2>Qualification inbox</h2></div>
            <Link className="primaryButton" href="/growth/leads">Open all leads</Link>
          </div>
          {realLeads.length ? realLeads.slice(0, 6).map((lead) => (
            <div className="listRow" key={lead.reference}>
              <div><strong>{lead.name} · {lead.serviceName}</strong><div className="small">{lead.email} · {lead.state} · {lead.goal}</div></div>
              <span className={`pill ${lead.status === 'new' ? 'medium' : 'low'}`}>{lead.status}</span>
            </div>
          )) : <div className="emptyState">No real qualification requests yet.</div>}
        </div>

        <div className="card span5">
          <div className="row">
            <div><div className="label">CLIENT PIPELINE</div><h2>Managed clients</h2></div>
            <Link className="secondaryButton" href="/clients">Manage</Link>
          </div>
          {realClients.length ? realClients.slice(0, 6).map((client) => (
            <Link className="listRow" href={`/clients/${client.id}`} key={client.id}>
              <div><strong>{client.displayName}</strong><div className="small">{client.kind} · {client.state}</div></div>
              <span className="pill low">{client.status}</span>
            </Link>
          )) : <div className="emptyState">No client records yet. Convert qualified leads after review.</div>}
        </div>

        <div className="card span6">
          <div className="label">RISK & RELEASE</div>
          <h2>{openGates.length ? 'Owner attention required' : 'Required controls ready'}</h2>
          {openGates.slice(0, 5).map((check) => (
            <div className="readinessRow" key={check.id}>
              <div><strong>{check.label}</strong><div className="small">{check.detail}</div></div>
              <span className="pill medium">{check.status}</span>
            </div>
          ))}
          {!openGates.length ? <div className="emptyState">All required production controls are ready.</div> : null}
          <div className="headerActions"><Link className="secondaryButton" href="/launch">Launch control</Link><Link className="secondaryButton" href="/compliance">Compliance center</Link></div>
        </div>

        <div className="card span6">
          <div className="label">SYSTEM OPERATIONS</div>
          <h2>Technical signals stay secondary.</h2>
          <div className="ownerQuickLinks">
            <Link href="/dashboard">{runs.length} recent governed AI runs</Link>
            <Link href="/dashboard">{failedRuns} failed runs</Link>
            <Link href="/compliance">{blockedEvents} blocked audit events</Link>
            <Link href="/launch">{openGates.length} open production gates</Link>
            <span>{activeUsers} active authorized users</span>
          </div>
        </div>

        <div className="card span12">
          <div className="row">
            <div>
              <div className="label">OWNER GOVERNANCE</div>
              <h2>Private, MFA-protected New850 control plane.</h2>
              <div className="small">Signed in as {session.email} · owner role verified · MFA assured. Customer readiness remains planning support, regulated actions remain consent-controlled, and technical controls fail closed when required.</div>
            </div>
            <Link className="secondaryButton" href="/dashboard">System Operations</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
