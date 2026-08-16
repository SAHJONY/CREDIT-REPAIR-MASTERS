import { PortalNav } from '@/components/portal-nav';
import { requireCustomerPortalSession } from '@/lib/customer-portal';
import { getPaymentProviders } from '@/lib/payment-providers';

export const dynamic = 'force-dynamic';

function methodLabel(method: string) {
  return method.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function PortalPaymentsPage() {
  const portal = await requireCustomerPortalSession();
  const providers = getPaymentProviders();
  const configured = providers.filter((provider) => provider.configured);

  return (
    <main>
      <header className="appHeader">
        <div>
          <div className="kicker">MY CREDIT REPAIR MASTERS / PAYMENTS</div>
          <h1>Payments</h1>
          <p className="subtitle">Choose an approved payment method only when your account shows an eligible amount due.</p>
        </div>
        <PortalNav />
      </header>

      <section className="grid">
        <div className="card span4"><div className="label">Client</div><h2>{portal.client.displayName}</h2><div className="small">{portal.client.state} · secure portal account</div></div>
        <div className="card span4"><div className="label">Configured rails</div><div className="value">{configured.length}</div><div className="small">of {providers.length} supported providers</div></div>
        <div className="card span4"><div className="label">Collection control</div><div className="value statusValue">GATED</div><div className="small">billing eligibility approval is required before checkout</div></div>

        <div className="card span12">
          <div className="label">Payment methods</div>
          <h2>Debit, credit, wallets, and bank payment</h2>
          <p className="small">CREDIT REPAIR MASTERS does not collect raw card numbers in the application. Card entry will be tokenized or hosted by the selected payment processor.</p>
          <div className="grid" style={{ marginTop: 14 }}>
            {providers.map((provider) => (
              <div className="card span4" key={provider.id}>
                <div className="label">{provider.mode}</div>
                <h2>{provider.name}</h2>
                <div className="value statusValue">{provider.configured ? 'READY' : 'SETUP'}</div>
                <p className="small">{provider.detail}</p>
                <div className="small" style={{ marginTop: 12 }}>{provider.methods.map(methodLabel).join(' · ')}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card span12">
          <div className="label">Payment safety</div>
          <h2>No charge button appears before eligibility</h2>
          <div className="guardrail">The billing engine must first approve the service, state, sales channel, service-completion status, contract status, and cancellation timing. Zelle payments remain unverified until staff reconciliation; a customer-reported transfer is never treated as paid automatically.</div>
        </div>
      </section>
    </main>
  );
}
