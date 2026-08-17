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
    { tone: 'blue', title: 'Consumer credit intelligence', note: 'Evidence-first analysis and recovery management with jurisdiction-aware billing controls.', services: consumer },
    { tone: 'emerald', title: 'Business credit advisory', note: 'Business profile, reporting and funding-readiness advisory separated from consumer credit repair.', services: business },
    { tone: 'violet', title: 'CREDIT REPAIR MASTERS OS', note: 'Premium software infrastructure for credit professionals and agencies.', services: b2b }
  ];

  return (
    <main className="commercialCinema">
      <section className="commercialHero">
        <div className="commercialHeroImage" aria-hidden="true" />
        <div className="commercialHeroShade" />
        <div className="commercialHeroCopy">
          <div className="cinematicEyebrow">CREDIT REPAIR MASTERS · COMMERCIAL MODEL</div>
          <h1>Choose the level of support<br/><em>that fits your next move.</em></h1>
          <p>Consumer intelligence, business-credit advisory and professional software—each delivered through a controlled, secure operating model.</p>
          <div className="publicCinemaActions"><Link className="goldButton" href="/get-started">Get started <span>→</span></Link><Link className="glassButton" href="/dashboard">Owner OS</Link></div>
        </div>
        <div className="commercialHeroStats">
          <div><small>MODEL</small><strong>3</strong><span>revenue lines</span></div>
          <div><small>CONTROL</small><strong>Gate</strong><span>before sensitive billing</span></div>
          <div><small>DELIVERY</small><strong>Secure</strong><span>portal + evidence workflow</span></div>
        </div>
      </section>

      <section className="commercialGroups">
        {groups.map((group) => (
          <div className={`commercialGroup ${group.tone}`} key={group.title}>
            <div className="commercialGroupIntro"><div className="cinematicEyebrow">REVENUE LINE</div><h2>{group.title}</h2><p>{group.note}</p></div>
            <div className="commercialServiceGrid">
              {group.services.map((service) => (
                <article className="commercialServiceCard" key={service.id}>
                  <div className="commercialServiceTop"><span>{service.billingModel.replaceAll('_', ' ')}</span><strong>{price(service)}</strong></div>
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                  <div className="commercialDeliverables">{service.deliverables.map((item) => <div key={item}>✓ {item}</div>)}</div>
                  <small>Payment policy: {service.paymentPolicy.replaceAll('_', ' ')}</small>
                  <Link className="goldButton compact" href={`/get-started?service=${service.id}`}>Choose this service →</Link>
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="commercialSafety">
        <div><div className="cinematicEyebrow goldText">BILLING SAFETY</div><h2>Qualification comes before checkout.</h2><p>The system evaluates jurisdiction, sales channel, service status, contract status and cancellation timing before eligible consumer-credit billing can be enabled.</p></div>
        <Link className="goldButton" href="/get-started">Open qualification path →</Link>
      </section>
    </main>
  );
}