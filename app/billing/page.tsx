import Link from 'next/link';
import { redirect } from 'next/navigation';
import { BillingInvoiceCreateForm } from '@/components/billing-invoice-create-form';
import { SignOutButton } from '@/components/sign-out-button';
import { listBillingInvoices } from '@/lib/billing-store';
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
  const collected = invoices.filter((invoice) => invoice.status === 'paid').reduce((sum, invoice) => sum + invoice.amountCents, 0);
  const outstanding = invoices.filter((invoice) => invoice.status === 'open' || invoice.status === 'checkout_pending').reduce((sum, invoice) => sum + invoice.amountCents, 0);
  const billableClients = clients.filter((client) => client.status !== 'closed');
  const fixedServices = commercialServices.filter((service): service is typeof service & { priceCents: number } => typeof service.priceCents === 'number');
  const canIssue = ['owner', 'admin', 'credit_specialist'].includes(session.member.role);

  return <main>
    <header className="appHeader">
      <div><div className="kicker">CREDIT REPAIR MASTERS / REVENUE</div><h1>Billing Command Center</h1><p className="subtitle">Post-performance invoicing, payment collection, and settlement reconciliation.</p></div>
      <div className="headerActions"><Link className="secondaryButton" href="/clients">Clients</Link><Link className="secondaryButton" href="/dashboard">Dashboard</Link><SignOutButton /></div>
    </header>
    <section className="grid">
      <div className="card span3"><div className="label">Collected</div><div className="value">{money(collected)}</div><div className="small">verified paid invoices</div></div>
      <div className="card span3"><div className="label">Outstanding</div><div className="value">{money(outstanding)}</div><div className="small">eligible invoices awaiting settlement</div></div>
      <div className="card span3"><div className="label">Invoices</div><div className="value">{invoices.length}</div><div className="small">all billing records</div></div>
      <div className="card span3"><div className="label">Paid</div><div className="value">{invoices.filter((invoice) => invoice.status === 'paid').length}</div><div className="small">processor-verified settlements</div></div>

      {canIssue ? <div className="card span5"><div className="label">Issue invoice</div><h2>Bill only after the gate approves</h2><BillingInvoiceCreateForm clients={billableClients.map((client) => ({ id: client.id, name: client.displayName, state: client.state }))} services={fixedServices.map((service) => ({ id: service.id, name: service.name, priceCents: service.priceCents }))} /></div> : null}

      <div className={`card ${canIssue ? 'span7' : 'span12'}`}><div className="label">Invoice ledger</div><h2>Revenue history</h2>
        {invoices.length ? invoices.map((invoice) => {
          const client = clientMap.get(invoice.clientId);
          return <div className="listRow" key={invoice.id}><div><strong>{client?.displayName || invoice.clientId}</strong><div className="small">{invoice.milestoneLabel} · {money(invoice.amountCents)} · {new Date(invoice.createdAt).toLocaleDateString()}</div></div><span className={`pill ${invoice.status === 'paid' ? 'low' : invoice.status === 'void' ? 'high' : 'medium'}`}>{invoice.status}</span></div>;
        }) : <div className="emptyState">No invoices yet. A bill is created only after the compliance gate confirms collection is permitted.</div>}
      </div>

      <div className="card span12"><div className="label">Revenue controls</div><h2>Settlement is processor-verified</h2><div className="guardrail">Customer browser redirects never mark an invoice paid. Stripe must send a valid signed webhook, the invoice amount must match, and the checkout session must reconcile to the internal invoice before settlement is recorded.</div></div>
    </section>
  </main>;
}
