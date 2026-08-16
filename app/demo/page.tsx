import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SignOutButton } from '@/components/sign-out-button';
import { listBillingInvoices } from '@/lib/billing-store';
import { getBusinessSession } from '@/lib/session-access';
import { getPlatformStore } from '@/lib/platform-store';

export const dynamic = 'force-dynamic';

const demoIds = [
  'client_personal_demo_sahjony_gonzalez',
  'client_billing_demo_fl',
  'client_business_demo'
] as const;

function money(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

export default async function DemoCommandCenterPage() {
  const session = await getBusinessSession();
  if (!session) redirect('/auth/sign-in');
  if (session.mfaRequired && !session.mfaAssured) redirect('/auth/mfa');

  const store = getPlatformStore();
  const clients = await store.listClients(session.organizationId);
  const demos = clients.filter((client) => demoIds.includes(client.id as (typeof demoIds)[number]));
  const invoices = await listBillingInvoices(session.organizationId);

  const snapshots = await Promise.all(demos.map(async (client) => {
    const [consents, evidence, runs, audit] = await Promise.all([
      store.listConsents(session.organizationId, client.id),
      store.listEvidence(session.organizationId, client.id),
      store.listAgentRuns(session.organizationId, 200),
      store.listAudit(session.organizationId, 200)
    ]);
    const clientRuns = runs.filter((run) => run.clientId === client.id);
    const clientAudit = audit.filter((entry) => entry.resourceId === client.id || entry.metadata?.clientId === client.id);
    const clientInvoices = invoices.filter((invoice) => invoice.clientId === client.id);
    const outstanding = clientInvoices
      .filter((invoice) => invoice.status === 'open' || invoice.status === 'checkout_pending')
      .reduce((sum, invoice) => sum + invoice.amountCents, 0);

    return { client, consents, evidence, clientRuns, clientAudit, clientInvoices, outstanding };
  }));

  return (
    <main>
      <header className="appHeader">
        <div>
          <div className="kicker">CREDIT REPAIR MASTERS / DEMO OS / v3.2</div>
          <h1>Demo Command Center</h1>
          <p className="subtitle">Three isolated fixtures demonstrate personal credit, billing, and business credit workflows without representing real customers or real revenue.</p>
        </div>
        <div className="headerActions">
          <Link className="secondaryButton" href="/dashboard">Dashboard</Link>
          <Link className="secondaryButton" href="/billing">Billing</Link>
          <Link className="secondaryButton" href="/clients">Clients</Link>
          <SignOutButton />
        </div>
      </header>

      <section className="grid">
        <div className="card span12">
          <div className="label">Guardrail</div>
          <h2>Demo data only</h2>
          <div className="guardrail">These fixtures are intentionally marked DEMO. They must never be presented as real customer records, real disputes, or real collected revenue. Payment status may only become PAID through the normal processor-verified settlement flow.</div>
        </div>

        {snapshots.map(({ client, consents, evidence, clientRuns, clientAudit, clientInvoices, outstanding }) => {
          const title = client.id === 'client_personal_demo_sahjony_gonzalez'
            ? 'Personal Credit Demo'
            : client.id === 'client_billing_demo_fl'
              ? 'Billing Demo'
              : 'Business Credit Demo';
          const objective = client.id === 'client_personal_demo_sahjony_gonzalez'
            ? 'Onboarding → consent → evidence → AI analysis → compliance → owner review'
            : client.id === 'client_billing_demo_fl'
              ? 'Completed service → eligible invoice → customer portal → Stripe settlement'
              : 'Business intake → business-credit evidence → AI strategy → compliance → accelerator milestone';

          return (
            <div className="card span4" key={client.id}>
              <div className="row">
                <div>
                  <div className="label">DEMO / NOT REAL CUSTOMER</div>
                  <h2>{title}</h2>
                </div>
                <span className="pill medium">DEMO</span>
              </div>
              <p className="small">{client.displayName} · {client.kind} · {client.state} · {client.status}</p>
              <div className="small" style={{ marginTop: 10 }}>{objective}</div>

              <div className="grid" style={{ marginTop: 14 }}>
                <div className="card span6"><div className="label">Consents</div><div className="value">{consents.length}</div></div>
                <div className="card span6"><div className="label">Evidence</div><div className="value">{evidence.length}</div></div>
                <div className="card span6"><div className="label">AI runs</div><div className="value">{clientRuns.length}</div></div>
                <div className="card span6"><div className="label">Audit</div><div className="value">{clientAudit.length}</div></div>
              </div>

              <div className="listRow" style={{ marginTop: 14 }}>
                <div><strong>Billing state</strong><div className="small">{clientInvoices.length} invoice record{clientInvoices.length === 1 ? '' : 's'}</div></div>
                <span className={`pill ${outstanding > 0 ? 'medium' : 'low'}`}>{money(outstanding)} open</span>
              </div>

              <div className="headerActions" style={{ marginTop: 14 }}>
                <Link className="primaryButton" href={`/clients/${client.id}`}>Open workspace</Link>
                {client.id === 'client_billing_demo_fl' ? <Link className="secondaryButton" href="/billing">Open billing</Link> : null}
                <Link className="secondaryButton" href="/clients/portal-access">Portal access</Link>
              </div>
            </div>
          );
        })}

        <div className="card span12">
          <div className="label">Demo sequence</div>
          <h2>Run the business from A → Z</h2>
          <div className="grid" style={{ marginTop: 14 }}>
            {[
              ['1. Personal lifecycle', 'Use Sahjony Gonzalez to demonstrate consumer onboarding, consent, evidence, analysis, and approval gates.'],
              ['2. Billing lifecycle', 'Use Billing Demo to demonstrate post-performance invoice creation, customer checkout, webhook settlement, and revenue reconciliation.'],
              ['3. Business lifecycle', 'Use Business Demo to demonstrate entity intake, business-credit readiness, tradeline strategy, compliance review, and accelerator completion.'],
              ['4. Portal isolation', 'Each demo must use a separate client identity and must never inherit Owner permissions.']
            ].map(([heading, detail]) => <div className="card span3" key={heading}><strong>{heading}</strong><div className="small" style={{ marginTop: 6 }}>{detail}</div></div>)}
          </div>
        </div>
      </section>
    </main>
  );
}
