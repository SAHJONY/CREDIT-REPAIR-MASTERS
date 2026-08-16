import { PortalNav } from '@/components/portal-nav';
import { PortalCheckoutButton } from '@/components/portal-checkout-button';
import { listBillingInvoices } from '@/lib/billing-store';
import { requireCustomerPortalSession } from '@/lib/customer-portal';
import { getPaymentProviders } from '@/lib/payment-providers';
import { getCommercialService } from '@/lib/service-catalog';

export const dynamic = 'force-dynamic';

function methodLabel(method: string) {
  return method.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function money(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

export default async function PortalPaymentsPage() {
  const portal = await requireCustomerPortalSession();
  const [invoices, providers] = await Promise.all([
    listBillingInvoices(portal.organizationId, portal.client.id),
    Promise.resolve(getPaymentProviders())
  ]);
  const configured = providers.filter((provider) => provider.configured);
  const stripeReady = providers.find((provider) => provider.id === 'stripe')?.configured ?? false;
  const due = invoices.filter((invoice) => invoice.status === 'open' || invoice.status === 'checkout_pending');
  const paid = invoices.filter((invoice) => invoice.status === 'paid');
  const balance = due.reduce((sum, invoice) => sum + invoice.amountCents, 0);

  return (
    <main>
      <header className="appHeader">
        <div>
          <div className="kicker">MY CREDIT REPAIR MASTERS / BILLING</div>
          <h1>Payments & Receipts</h1>
          <p className="subtitle">Pay only approved invoices for completed, eligible services and review your payment history.</p>
        </div>
        <PortalNav />
      </header>

      <section className="grid">
        <div className="card span4"><div className="label">Amount due</div><div className="value">{money(balance)}</div><div className="small">{due.length} eligible invoice{due.length === 1 ? '' : 's'}</div></div>
        <div className="card span4"><div className="label">Paid invoices</div><div className="value">{paid.length}</div><div className="small">processor-verified receipts</div></div>
        <div className="card span4"><div className="label">Secure checkout</div><div className="value statusValue">{stripeReady ? 'READY' : 'SETUP'}</div><div className="small">hosted checkout; no raw card storage</div></div>

        <div className="card span12">
          <div className="label">Amount due</div>
          <h2>Eligible invoices</h2>
          {due.length ? due.map((invoice) => {
            const service = getCommercialService(invoice.serviceId);
            return <div className="listRow" key={invoice.id} style={{ alignItems: 'center' }}>
              <div><strong>{service?.name || invoice.serviceId}</strong><div className="small">{invoice.milestoneLabel} · {money(invoice.amountCents)} · issued {new Date(invoice.createdAt).toLocaleDateString()}</div></div>
              <div>{stripeReady ? <PortalCheckoutButton invoiceId={invoice.id} /> : <span className="pill medium">checkout setup</span>}</div>
            </div>;
          }) : <div className="emptyState">You have no eligible amount due. CREDIT REPAIR MASTERS will not present a charge until the billing gate approves collection.</div>}
        </div>

        <div className="card span7"><div className="label">Receipts</div><h2>Payment history</h2>
          {paid.length ? paid.map((invoice) => {
            const service = getCommercialService(invoice.serviceId);
            return <div className="listRow" key={invoice.id}><div><strong>{service?.name || invoice.serviceId}</strong><div className="small">{invoice.milestoneLabel} · {money(invoice.amountCents)} · paid {invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString() : 'verified'}</div></div><span className="pill low">PAID</span></div>;
          }) : <div className="emptyState">No completed payments yet.</div>}
        </div>

        <div className="card span5">
          <div className="label">Payment methods</div>
          <h2>Secure processor rails</h2>
          <p className="small">Card numbers are entered on processor-hosted or tokenized checkout, not stored by CREDIT REPAIR MASTERS.</p>
          {providers.map((provider) => <div className="listRow" key={provider.id}><div><strong>{provider.name}</strong><div className="small">{provider.methods.map(methodLabel).join(' · ')}</div></div><span className={`pill ${provider.configured ? 'low' : 'medium'}`}>{provider.configured ? 'ready' : 'setup'}</span></div>)}
        </div>

        <div className="card span12"><div className="label">Payment safety</div><h2>No payment is accepted outside the billing gate</h2><div className="guardrail">The system checks the service, jurisdiction, sales channel, completion status, agreement status, and cancellation timing before an invoice can be issued. A successful browser redirect is not proof of payment; settlement requires a verified processor webhook.</div></div>
      </section>
    </main>
  );
}
