import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SignOutButton } from '@/components/sign-out-button';
import { isDemoClient } from '@/lib/demo-fixtures';
import { getBusinessSession } from '@/lib/session-access';
import { getPlatformStore } from '@/lib/platform-store';
import { resolveProductionReadiness } from '@/lib/production-readiness';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getBusinessSession();
  if (!session) redirect('/auth/sign-in');
  if (session.mfaRequired && !session.mfaAssured) redirect('/auth/mfa');

  const store = getPlatformStore();
  const [organization, clients, audit, runs, productionReadiness] = await Promise.all([
    store.getOrganization(session.organizationId),
    store.listClients(session.organizationId),
    store.listAudit(session.organizationId, 8),
    store.listAgentRuns(session.organizationId, 8),
    resolveProductionReadiness(session.organizationId)
  ]);
  const checks = productionReadiness.checks;
  const readiness = productionReadiness.summary;
  const realClients = clients.filter((client) => !isDemoClient(client));
  const demoClients = clients.filter(isDemoClient);
  const activeClients = realClients.filter((client) => client.status === 'active').length;
  const onboarding = realClients.filter((client) => client.status === 'onboarding').length;
  const openGates = checks.filter((check) => check.requiredForProduction && check.status !== 'ready');

  return (
    <main>
      <header className="ownerHero">
        <div><div className="kicker">{organization?.name || 'CREDIT REPAIR MASTERS'} / OWNER OS / v6</div><h1>Operations Command Center</h1><p className="subtitle">Live business operations, client activity, readiness and AI execution from one control plane.</p></div>
        <div className="ownerNav"><Link className="primaryButton" href="/clients">Clients</Link><Link className="secondaryButton" href="/billing">Billing</Link><Link className="secondaryButton" href="/documents">Documents</Link><Link className="secondaryButton" href="/growth">Growth</Link><Link className="secondaryButton" href="/launch">Launch</Link><SignOutButton /></div>
      </header>

      <section className="ownerKpiGrid">
        <div className="ownerKpi"><span>REAL CLIENTS</span><strong>{realClients.length}</strong><small>{activeClients} active · {onboarding} onboarding</small></div>
        <div className="ownerKpi"><span>PRODUCTION READINESS</span><strong>{readiness.percent}%</strong><small>{readiness.ready}/{readiness.required} required controls</small></div>
        <div className="ownerKpi"><span>OPEN LAUNCH GATES</span><strong>{openGates.length}</strong><small>{openGates.length ? 'requires owner attention' : 'required controls ready'}</small></div>
        <div className="ownerKpi"><span>RECENT AGENT RUNS</span><strong>{runs.length}</strong><small>latest execution records</small></div>
      </section>

      <section className="ownerActionStrip">
        <div className="ownerActionCard"><div className="label">OWNER FOCUS</div><h2>{openGates.length ? 'Close remaining production gates' : 'Operate and prove revenue'}</h2><p>{openGates.length ? `${openGates.length} required control${openGates.length === 1 ? '' : 's'} still need attention before the system can consider the launch fully ready.` : 'Required production controls are ready. Prioritize active clients, settlement proof and measurable revenue execution.'}</p><div className="headerActions"><Link className="primaryButton" href={openGates.length ? '/launch' : '/growth'}>{openGates.length ? 'Open Launch Center' : 'Open Growth OS'}</Link><Link className="secondaryButton" href="/clients">Manage clients</Link></div></div>
        <div className="ownerActionCard"><div className="label">QUICK ACCESS</div><div className="ownerQuickLinks"><Link href="/billing">Revenue & billing</Link><Link href="/documents">Document center</Link><Link href="/compliance">Compliance</Link><Link href="/demo">Demo OS</Link></div></div>
      </section>

      <section className="grid">
        <div className="card span7"><div className="row"><div><div className="label">CLIENT PIPELINE</div><h2>Recent clients</h2></div><Link className="primaryButton" href="/clients">Manage clients</Link></div>{clients.length ? clients.slice(0, 8).map((client) => <Link className="listRow" href={`/clients/${client.id}`} key={client.id}><div><strong>{client.displayName}</strong><div className="small">{client.kind} · {client.state}</div></div><span className={`pill ${isDemoClient(client) ? 'medium' : 'low'}`}>{isDemoClient(client) ? 'demo' : client.status}</span></Link>) : <div className="emptyState">No client records yet. Create the first client from Client Management.</div>}</div>

        <div className="card span5"><div className="label">PRODUCTION GATES</div><h2>{openGates.length ? 'Requires attention' : 'Required controls ready'}</h2>{openGates.map((check) => <div className="readinessRow" key={check.id}><div><strong>{check.label}</strong><div className="small">{check.detail}</div></div><span className="pill medium">{check.status}</span></div>)}{!openGates.length ? <div className="emptyState">All required production controls are ready.</div> : null}</div>

        <div className="card span6"><div className="label">AUDIT LEDGER</div><h2>Latest activity</h2>{audit.length ? audit.map((item) => <div className="listRow" key={item.id}><div><strong>{item.action.replaceAll('_',' ')}</strong><div className="small">{item.actorId} · {new Date(item.createdAt).toLocaleString()}</div></div><span className={`pill ${item.decision === 'blocked' ? 'high' : item.decision === 'approval_required' ? 'medium' : 'low'}`}>{item.decision || 'logged'}</span></div>) : <div className="emptyState">No audit events yet.</div>}</div>

        <div className="card span6"><div className="label">AI OPERATIONS</div><h2>Recent agent runs</h2>{runs.length ? runs.map((run) => <div className="listRow" key={run.id}><div><strong>{run.agent}</strong><div className="small">{run.model || 'model not recorded'} · {run.toolCalls} tools</div></div><span className={`pill ${run.status === 'failed' ? 'high' : run.status === 'fallback' ? 'medium' : 'low'}`}>{run.status}</span></div>) : <div className="emptyState">No agent runs recorded yet.</div>}</div>

        <div className="card span12"><div className="row"><div><div className="label">ENVIRONMENT</div><h2>Live production workspace</h2><div className="small">Signed in as {session.email} · {session.member.role} · MFA assured · {demoClients.length} demo fixture{demoClients.length === 1 ? '' : 's'} excluded from real KPIs.</div></div><Link className="secondaryButton" href="/launch">View launch controls</Link></div></div>
      </section>
    </main>
  );
}