import Link from 'next/link';
import { redirect } from 'next/navigation';
import { BillingInvoiceActions } from '@/components/billing-invoice-actions';
import { BillingInvoiceCreateForm } from '@/components/billing-invoice-create-form';
import { SignOutButton } from '@/components/sign-out-button';
import { listBillingInvoices } from '@/lib/billing-store';
import { isDemoClient } from '@/lib/demo-fixtures';
import { getBusinessSession } from '@/lib/session-access';
import { getPlatformStore } from '@/lib/platform-store';
import { commercialServices } from '@/lib/service-catalog';

export const dynamic = 'force-dynamic';

function money(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

export default async function BillingPage() {
  const session = await getBusinessSession();
  if (!session) redirect('/auth/sign-in');
  if (session.mfaRequired && !session.mfaAssured) redirect('/auth/mfa');
  if (!['owner', 'admin', 'credit_specialist', 'compliance_reviewer', 'auditor'].includes(session.member.role)) redirect('/dashboard');

  const store = getPlatformStore();
  const [clients, invoices] = await Promise.all([
    store.listClients(session.organizationId),
    listBillingInvoices(session.organizationId)
  ]);
  const clientMap = new Map(clients.map((client) => [client.id, client]));
  const realClientIds = new Set(clients.filter((client) => !isDemoClient(client)).map((client) => client.id));
  const demoClientIds = new Set(clients.filter(isDemoClient).map((client) => client.id));
  const realInvoices = invoices.filter((invoice) => realClientIds.has(invoice.clientId));
  const demoInvoices = invoices.filter((invoice) => demoClientIds.has(invoice.clientId));
  const collected = realInvoices.filter((invoice) => invoice.status === 'paid').reduce((sum, invoice) => sum + invoice.amountCents, 0);
  const outstanding = realInvoices.filter((invoice) => invoice.status === 'open' || invoice.status === 'checkout_pending').reduce((sum, invoice) => sum + invoice.amountCents, 0);
  const billableClients = clients.filter((client) => client.status !== 'closed' && !isDemoClient(client));
  const fixedServices = commercialServices.filter((service): service is typeof service & { priceCents: number } => typeof service.priceCents === 'number');
  const canIssue = ['owner', 'admin', 'credit_specialist'].includes(session.member.role);
  const canVoid = ['owner', 'admin'].includes(session.member.role);

  return <main>
    <header className="appHeader">
      <div><div className="kicker">CREDIT REPAIR MASTERS / REVENUE</div><h1>Billing Command Center</h1><p className="subtitle">Post-performance invoicing, payment collection, and settlement reconciliation. Demo fixtures are excluded from real financial KPIs.</p></div>
      <div className="headerActions"><Link className="secondaryButton" href="/launch">Launch Center</Link><Link className="secondaryButton" href="/demo">Demo OS</Link><Link className="secondaryButton" href="/clients">Clients</Link><Link className="secondaryButton" href="/dashboard">Dashboard</Link><SignOutButton /></div>
    </header>
    <section className="grid">
      <div className="card span3"><div className="label">Collected</div><div className="value">{money(collected)}</div><div className="small">real processor-verified paid invoices</div></div>
      <div className="card span3"><div className="label">Outstanding</div><div className="value">{money(outstanding)}</div><div className="small">real eligible invoices awaiting settlement</div></div>
      <div className="card span3"><div className="label">Real invoices</div><div className="value">{realInvoices.length}</div><div className="small">demo fixtures excluded</div></div>
      <div className="card span3"><div className="label">Real paid</div><div className="value">{realInvoices.filter((invoice) => invoice.status === 'paid').length}</div><div className="small">processor-verified settlements</div></div>

      {canIssue ? <div className="card span5"><div className="label">Issue real invoice</div><h2>Bill only after the gate approves</h2><BillingInvoiceCreateForm clients={billableClients.map((client) => ({ id: client.id, name: client.displayName, state: client.state }))} services={fixedServices.map((service) => ({ id: service.id, name: service.name, priceCents: service.priceCents }))} /><div className="guardrail" style={{ marginTop: 12 }}>Demo clients are intentionally unavailable here. Use Demo OS to demonstrate billing without contaminating real revenue.</div></div> : null}

      <div className={`card ${canIssue ? 'span7' : 'span12'}`}><div className="label">Real invoice ledger</div><h2>Revenue history</h2>
        {realInvoices.length ? realInvoices.map((invoice) => {
          const client = clientMap.get(invoice.clientId);
          return <div className="listRow" key={invoice.id} style={{ alignItems: 'center' }}>
            <div>
              <strong>{client?.displayName || invoice.clientId}</strong>
              <div className="small">{invoice.milestoneLabel} · {money(invoice.amountCents)} · {new Date(invoice.createdAt).toLocaleDateString()}</div>
              <div className="small">Invoice {invoice.id} · {invoice.checkoutUrl ? 'Stripe checkout created' : invoice.status === 'open' ? 'Waiting for customer checkout' : 'No checkout link'}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <span className={`pill ${invoice.status === 'paid' ? 'low' : invoice.status === 'void' ? 'high' : 'medium'}`}>{invoice.status}</span>
              {canVoid ? <BillingInvoiceActions invoiceId={invoice.id} status={invoice.status} checkoutUrl={invoice.checkoutUrl} /> : null}
            </div>
          </div>;
        }) : <div className="emptyState">No real invoices yet. Revenue stays at $0 until a real client passes the billing gate.</div>}
      </div>

      <div className="card span12"><div className="row"><div><div className="label">Demo billing ledger</div><h2>Training and sales demonstration only</h2></div><Link className="secondaryButton" href="/demo">Open Demo OS</Link></div>
        {demoInvoices.length ? demoInvoices.map((invoice) => {
          const client = clientMap.get(invoice.clientId);
          return <div className="listRow" key={invoice.id}><div><strong>{client?.displayName || invoice.clientId}</strong><div className="small">{invoice.milestoneLabel} · {money(invoice.amountCents)} · Invoice {invoice.id}</div></div><span className="pill medium">DEMO · {invoice.status}</span></div>;
        }) : <div className="emptyState">No demo invoices.</div>}
        <div className="guardrail" style={{ marginTop: 12 }}>Demo invoices never contribute to Collected, Outstanding, Real invoices, or Real paid metrics.</div>
      </div>

      <div className="card span12"><div className="label">Revenue controls</div><h2>Settlement is processor-verified</h2><div className="guardrail">Customer browser redirects never mark an invoice paid. Stripe must send a valid signed webhook, the invoice amount must match, and the checkout session must reconcile to the internal invoice before settlement is recorded. Customers create secure checkout from their authenticated Payments & Receipts portal.</div></div>
    </section>
  </main>;
}
