import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SignOutButton } from '@/components/sign-out-button';
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
  const activeClients = clients.filter((client) => client.status === 'active').length;
  const onboarding = clients.filter((client) => client.status === 'onboarding').length;

  return (
    <main>
      <header className="appHeader">
        <div><div className="kicker">{organization?.name || 'CREDIT REPAIR MASTERS'} / OWNER OS / v3.2</div><h1>Operations Command Center</h1><p className="subtitle">Live tenant data from Neon. Signed in as {session.email} · {session.member.role} · MFA assured.</p></div>
        <div className="headerActions"><Link className="secondaryButton" href="/demo">Demo OS</Link><Link className="secondaryButton" href="/billing">Billing</Link><Link className="secondaryButton" href="/clients">Clients</Link><SignOutButton /></div>
      </header>

      <section className="grid">
        <div className="card span3"><div className="label">Clients</div><div className="value">{clients.length}</div><div className="small">{activeClients} active · {onboarding} onboarding</div></div>
        <div className="card span3"><div className="label">Readiness</div><div className="value">{readiness.percent}%</div><div className="small">{readiness.ready}/{readiness.required} required controls</div></div>
        <div className="card span3"><div className="label">Recent audit events</div><div className="value">{audit.length}</div><div className="small">latest tenant activity</div></div>
        <div className="card span3"><div className="label">Recent agent runs</div><div className="value">{runs.length}</div><div className="small">latest execution records</div></div>

        <div className="card span12">
          <div className="row"><div><div className="label">Demo operating system</div><h2>Personal · Billing · Business</h2><div className="small">Three isolated fixtures demonstrate the full business lifecycle without representing real customers or real revenue.</div></div><Link className="primaryButton" href="/demo">Open Demo Command Center</Link></div>
        </div>

        <div className="card span7">
          <div className="row"><div><div className="label">Client pipeline</div><h2>Client records</h2></div><Link className="primaryButton" href="/clients">Manage clients</Link></div>
          {clients.length ? clients.slice(0, 8).map((client) => (
            <Link className="listRow" href={`/clients/${client.id}`} key={client.id}>
              <div><strong>{client.displayName}</strong><div className="small">{client.kind} · {client.state}</div></div>
              <span className={`pill ${client.displayName.startsWith('DEMO —') ? 'medium' : 'low'}`}>{client.displayName.startsWith('DEMO —') ? 'demo' : client.status}</span>
            </Link>
          )) : <div className="emptyState">No client records yet. Create the first client from Client Management.</div>}
        </div>

        <div className="card span5">
          <div className="label">Production gates</div><h2>What still blocks full launch</h2>
          {checks.filter((check) => check.requiredForProduction && check.status !== 'ready').map((check) => (
            <div className="readinessRow" key={check.id}><div><strong>{check.label}</strong><div className="small">{check.detail}</div></div><span className="pill medium">{check.status}</span></div>
          ))}
        </div>

        <div className="card span6">
          <div className="label">Audit ledger</div><h2>Latest activity</h2>
          {audit.length ? audit.map((item) => <div className="listRow" key={item.id}><div><strong>{item.action}</strong><div className="small">{item.actorId} · {new Date(item.createdAt).toLocaleString()}</div></div><span className={`pill ${item.decision === 'blocked' ? 'high' : item.decision === 'approval_required' ? 'medium' : 'low'}`}>{item.decision || 'logged'}</span></div>) : <div className="emptyState">No audit events yet.</div>}
        </div>

        <div className="card span6">
          <div className="label">Agent operations</div><h2>Recent runs</h2>
          {runs.length ? runs.map((run) => <div className="listRow" key={run.id}><div><strong>{run.agent}</strong><div className="small">{run.model || 'model not recorded'} · {run.toolCalls} tools</div></div><span className={`pill ${run.status === 'failed' ? 'high' : run.status === 'fallback' ? 'medium' : 'low'}`}>{run.status}</span></div>) : <div className="emptyState">No agent runs recorded yet.</div>}
        </div>
      </section>
    </main>
  );
}
