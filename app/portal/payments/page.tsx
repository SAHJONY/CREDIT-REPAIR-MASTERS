import { PortalNav } from '@/components/portal-nav';
import { PortalCheckoutButton } from '@/components/portal-checkout-button';
import { listBillingInvoices } from '@/lib/billing-store';
import { requireCustomerPortalSession } from '@/lib/customer-portal';
import { getPaymentProviders } from '@/lib/payment-providers';
import { getCommercialService } from '@/lib/service-catalog';

export const dynamic = 'force-dynamic';

function money(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

export default async function PortalPaymentsPage() {
  const portal = await requireCustomerPortalSession();
  const [invoices, providers] = await Promise.all([
    listBillingInvoices(portal.organizationId, portal.client.id),
    Promise.resolve(getPaymentProviders())
  ]);
  const stripeReady = providers.find((provider) => provider.id === 'stripe')?.configured ?? false;
  const squareReady = providers.find((provider) => provider.id === 'square')?.configured ?? false;
  const secureCheckoutReady = stripeReady || squareReady;
  const due = invoices.filter((invoice) => invoice.status === 'open' || invoice.status === 'checkout_pending');
  const paid = invoices.filter((invoice) => invoice.status === 'paid');
  const balance = due.reduce((sum, invoice) => sum + invoice.amountCents, 0);

  return (
    <main className="portalShell">
      <header className="portalHeader">
        <div><div className="portalBrand">CREDIT REPAIR MASTERS</div><div className="eyebrow portalPageEyebrow">SECURE BILLING</div><h1>Payments</h1><p className="subtitle">Review approved invoices, pay securely, and access your payment history.</p></div>
        <PortalNav />
      </header>

      <section className="portalPaymentHero">
        <div><div className="eyebrow">AMOUNT DUE</div><div className="portalBalance">{money(balance)}</div><p>{due.length ? `${due.length} approved invoice${due.length === 1 ? '' : 's'} ready for payment.` : 'You have no payment due right now.'}</p></div>
        <div className="portalPaymentStatus"><span>Secure checkout</span><strong>{secureCheckoutReady ? 'Available' : 'Not yet configured'}</strong><small>Your card information is entered directly with the payment processor and is not stored by CREDIT REPAIR MASTERS.</small></div>
      </section>

      <section className="grid">
        <section className="portalFeatureCard span12">
          <div className="eyebrow">APPROVED INVOICES</div><h2>{due.length ? 'Ready to pay' : 'Nothing due'}</h2>
          {due.length ? due.map((invoice) => { const service = getCommercialService(invoice.serviceId); return <article className="portalInvoiceCard" key={invoice.id}><div><strong>{service?.name || invoice.serviceId}</strong><span>{invoice.milestoneLabel}</span><small>Issued {new Date(invoice.createdAt).toLocaleDateString()}</small></div><div className="invoiceAmount">{money(invoice.amountCents)}</div><div className="portalPayActions">{squareReady ? <PortalCheckoutButton invoiceId={invoice.id} provider="square" label="Pay with Square" /> : null}{stripeReady ? <PortalCheckoutButton invoiceId={invoice.id} provider="stripe" label="Pay with Stripe" /> : null}{!secureCheckoutReady ? <span className="portalNotice">Secure checkout is being configured.</span> : null}</div></article>; }) : <div className="portalNotice success">✓ No approved invoice is currently due. You will only see a payment request after the service and billing requirements are satisfied.</div>}
        </section>

        <section className="portalFeatureCard span8"><div className="eyebrow">PAYMENT HISTORY</div><h2>Receipts</h2>{paid.length ? paid.map((invoice) => { const service = getCommercialService(invoice.serviceId); return <div className="portalRecord" key={invoice.id}><div><strong>{service?.name || invoice.serviceId}</strong><span>{invoice.milestoneLabel} · {invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString() : 'Payment verified'}</span></div><b>{money(invoice.amountCents)} · Paid</b></div>; }) : <div className="portalNotice">No completed payments yet.</div>}</section>
        <section className="portalFeatureCard span4"><div className="eyebrow">PAYMENT SECURITY</div><h2>Protected checkout</h2><p>Payments are completed on secure processor-hosted checkout. CREDIT REPAIR MASTERS does not store your full card number.</p><div className="portalTrustList"><span>✓ Approved invoices only</span><span>✓ Secure hosted checkout</span><span>✓ Verified payment receipts</span></div></section>
      </section>
    </main>
  );
}