import Link from 'next/link';
import { commercialServices } from '@/lib/service-catalog';

function money(cents?: number) {
  if (cents == null) return 'Custom';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100);
}

function price(service: (typeof commercialServices)[number]) {
  if (service.priceRangeCents) return `${money(service.priceRangeCents[0])}–${money(service.priceRangeCents[1])}`;
  const amount = money(service.priceCents);
  return service.billingModel === 'monthly' ? `${amount}/mo` : amount;
}

export default function ServicesPage() {
  const consumer = commercialServices.filter((service) => service.audience === 'consumer');
  const business = commercialServices.filter((service) => service.audience === 'business');
  const b2b = commercialServices.filter((service) => service.audience === 'b2b');
  const groups = [
    { title: 'Consumer credit intelligence', note: 'Consumer credit-service fees are gated by service completion, sales channel, contract status, cancellation rules, and state law.', services: consumer },
    { title: 'Business credit advisory', note: 'Business-focused advisory services are priced separately from consumer credit repair.', services: business },
    { title: 'CREDIT REPAIR MASTERS OS', note: 'Recurring B2B software revenue for credit professionals and agencies.', services: b2b }
  ];

  return (
    <main>
      <header className="appHeader">
        <div><div className="kicker">CREDIT REPAIR MASTERS / COMMERCIAL MODEL</div><h1>Services & pricing</h1><p className="subtitle">A diversified revenue model across consumer intelligence, business advisory, and B2B software.</p></div>
        <div className="headerActions"><Link className="secondaryButton" href="/dashboard">Owner OS</Link></div>
      </header>
      <section className="grid">
        {groups.map((group) => (
          <div className="card span12" key={group.title}>
            <div className="label">Revenue line</div><h2>{group.title}</h2><p className="small">{group.note}</p>
            <div className="grid" style={{ marginTop: 14 }}>
              {group.services.map((service) => (
                <div className="card span4" key={service.id}>
                  <div className="label">{service.billingModel.replaceAll('_', ' ')}</div><h2>{service.name}</h2><div className="value">{price(service)}</div><p className="small">{service.description}</p>
                  <div style={{ marginTop: 12 }}>{service.deliverables.map((item) => <div className="small" key={item}>• {item}</div>)}</div>
                  <div className="small" style={{ marginTop: 14 }}>Payment policy: {service.paymentPolicy.replaceAll('_', ' ')}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="card span12"><div className="label">Billing safety</div><h2>No payment is collected from this page</h2><p className="small">The billing eligibility API must approve the jurisdiction, sales channel, service status, contract status, and cancellation timing before a consumer-credit invoice or checkout can be enabled.</p></div>
      </section>
    </main>
  );
}
