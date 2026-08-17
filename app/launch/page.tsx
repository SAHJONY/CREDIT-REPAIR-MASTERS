import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SignOutButton } from '@/components/sign-out-button';
import { getBusinessSession } from '@/lib/session-access';
import { getPlatformStore } from '@/lib/platform-store';
import { resolveProductionReadiness } from '@/lib/production-readiness';
import { isDemoClient } from '@/lib/demo-fixtures';
import { listBillingInvoices } from '@/lib/billing-store';

export const dynamic = 'force-dynamic';

export default async function LaunchCenterPage() {
  const session = await getBusinessSession();
  if (!session) redirect('/auth/sign-in');
  if (session.mfaRequired && !session.mfaAssured) redirect('/auth/mfa');
  if (!['owner', 'admin', 'compliance_reviewer', 'auditor'].includes(session.member.role)) redirect('/dashboard');

  const store = getPlatformStore();
  const [readiness, clients, invoices] = await Promise.all([
    resolveProductionReadiness(session.organizationId),
    store.listClients(session.organizationId),
    listBillingInvoices(session.organizationId)
  ]);

  const realClients = clients.filter((client) => !isDemoClient(client));
  const demoClients = clients.filter(isDemoClient);
  const realClientIds = new Set(realClients.map((client) => client.id));
  const realInvoices = invoices.filter((invoice) => realClientIds.has(invoice.clientId));
  const required = readiness.checks.filter((check) => check.requiredForProduction);
  const blockers = required.filter((check) => check.status !== 'ready');
  const optional = readiness.checks.filter((check) => !check.requiredForProduction);

  const launchActions = [
    { label: 'Client operations', detail: 'Create real clients, record consent, and collect evidence through the controlled workspace.', href: '/clients', ready: realClients.length > 0 },
    { label: 'Private document vault', detail: 'Production evidence uploads require the private Blob credential and fail closed when unavailable.', href: '/clients', ready: readiness.checks.find((check) => check.id === 'vault')?.status === 'ready' },
    { label: 'Billing & settlement', detail: 'Real invoices exclude demo fixtures and require the compliance gate before customer checkout.', href: '/billing', ready: realInvoices.length > 0 },
    { label: 'Customer portal', detail: 'Invite customer identities with least privilege; clients never inherit Owner access.', href: '/clients/portal-access', ready: false },
    { label: 'Demo verification', detail: 'Use isolated personal, billing, and business fixtures to demonstrate workflows safely.', href: '/demo', ready: demoClients.length >= 3 },
    { label: 'Document examples', detail: 'Review synthetic examples before promoting any document to an approved production template.', href: '/demo/documents', ready: true }
  ] as const;

  return (
    <main>
      <header className="appHeader">
        <div><div className="kicker">CREDIT REPAIR MASTERS / PRODUCTION / v4.0</div><h1>Production Launch Center</h1><p className="subtitle">One place to decide whether the operating system is safe to launch, bill, and scale.</p></div>
        <div className="headerActions"><Link className="secondaryButton" href="/dashboard">Dashboard</Link><Link className="secondaryButton" href="/billing">Billing</Link><Link className="secondaryButton" href="/demo">Demo OS</Link><SignOutButton /></div>
      </header>

      <section className="grid">
        <div className="card span3"><div className="label">Readiness</div><div className="value">{readiness.summary.percent}%</div><div className="small">{readiness.summary.ready}/{readiness.summary.required} required controls</div></div>
        <div className="card span3"><div className="label">Launch blockers</div><div className="value">{blockers.length}</div><div className="small">required controls not ready</div></div>
        <div className="card span3"><div className="label">Real clients</div><div className="value">{realClients.length}</div><div className="small">demo fixtures excluded</div></div>
        <div className="card span3"><div className="label">Demo fixtures</div><div className="value">{demoClients.length}</div><div className="small">isolated from real revenue</div></div>

        <div className="card span7">
          <div className="row"><div><div className="label">Required production controls</div><h2>{readiness.summary.productionReady ? 'Required controls are ready' : 'Close these before full production'}</h2></div><span className={`pill ${readiness.summary.productionReady ? 'low' : 'medium'}`}>{readiness.summary.productionReady ? 'READY' : 'HOLD'}</span></div>
          {required.map((check) => <div className="readinessRow" key={check.id}><div><strong>{check.label}</strong><div className="small">{check.detail || 'No additional detail'}</div></div><span className={`pill ${check.status === 'ready' ? 'low' : check.status === 'blocked' ? 'high' : 'medium'}`}>{check.status}</span></div>)}
        </div>

        <div className="card span5">
          <div className="label">Launch actions</div><h2>Operational path</h2>
          {launchActions.map((action) => <Link className="listRow" href={action.href} key={action.label}><div><strong>{action.label}</strong><div className="small">{action.detail}</div></div><span className={`pill ${action.ready ? 'low' : 'medium'}`}>{action.ready ? 'ready' : 'next'}</span></Link>)}
        </div>

        <div className="card span6"><div className="label">Real business lane</div><h2>Production data only</h2><div className="guardrail">Real financial KPIs, client operations, invoices, and settlements must exclude all DEMO fixtures. A demo invoice can never increase Collected or Outstanding on the real Billing Command Center.</div><div className="headerActions" style={{ marginTop: 14 }}><Link className="primaryButton" href="/billing">Open real billing</Link><Link className="secondaryButton" href="/clients">Open clients</Link></div></div>

        <div className="card span6"><div className="label">Safe demo lane</div><h2>Training and sales only</h2><div className="guardrail">Demo customers, documents, evidence, invoices, and AI runs remain synthetic. They can demonstrate the complete workflow but must never be represented as real customer activity or collected revenue.</div><div className="headerActions" style={{ marginTop: 14 }}><Link className="primaryButton" href="/demo">Open Demo OS</Link><Link className="secondaryButton" href="/demo/documents">Document examples</Link></div></div>

        <div className="card span12"><div className="label">Optional / intentionally gated</div><h2>Scale after the core is stable</h2>{optional.map((check) => <div className="readinessRow" key={check.id}><div><strong>{check.label}</strong><div className="small">{check.detail || 'Optional for current launch model'}</div></div><span className={`pill ${check.status === 'ready' ? 'low' : check.status === 'blocked' ? 'high' : 'medium'}`}>{check.status}</span></div>)}</div>
      </section>
    </main>
  );
}
