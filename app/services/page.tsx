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
    { tone: 'blue', title: 'Consumer approval readiness', note: 'Measure credit blockers, improve controllable factors and track readiness against a specific financing goal.', services: consumer },
    { tone: 'emerald', title: 'Business funding readiness', note: 'Business profile, documentation, reporting and financing-readiness advisory without approval promises.', services: business },
    { tone: 'violet', title: 'Approval Readiness OS', note: 'Governed software for professionals and agencies to operate measurable credit-to-readiness workflows.', services: b2b }
  ];

  return (
    <main className="commercialCinema">
      <section className="commercialHero">
        <div className="commercialHeroImage" aria-hidden="true" />
        <div className="commercialHeroShade" />
        <div className="commercialHeroCopy">
          <div className="cinematicEyebrow">CREDIT REPAIR MASTERS · CREDIT-TO-APPROVAL READINESS PLATFORM</div>
          <h1>Choose the readiness path<br/><em>that matches your next financial move.</em></h1>
          <p>Consumer approval readiness, business funding readiness and professional software—each built around measurable blockers, documented progress and controlled financial shopping.</p>
          <div className="publicCinemaActions"><Link className="goldButton" href="/get-started">Check readiness <span>→</span></Link><Link className="glassButton" href="/dashboard">Owner OS</Link></div>
        </div>
        <div className="commercialHeroStats">
          <div><small>JOURNEY</small><strong>Goal</strong><span>before the intervention</span></div>
          <div><small>MEASURE</small><strong>0–100</strong><span>explainable readiness</span></div>
          <div><small>GATE</small><strong>85+</strong><span>plus zero P0 blockers</span></div>
        </div>
      </section>

      <section className="commercialGroups">
        {groups.map((group) => (
          <div className={`commercialGroup ${group.tone}`} key={group.title}>
            <div className="commercialGroupIntro"><div className="cinematicEyebrow">READINESS PRODUCT LINE</div><h2>{group.title}</h2><p>{group.note}</p></div>
            <div className="commercialServiceGrid">
              {group.services.map((service) => (
                <article className="commercialServiceCard" key={service.id}>
                  <div className="commercialServiceTop"><span>{service.billingModel.replaceAll('_', ' ')}</span><strong>{price(service)}</strong></div>
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                  <div className="commercialDeliverables">{service.deliverables.map((item) => <div key={item}>✓ {item}</div>)}</div>
                  <small>Payment policy: {service.paymentPolicy.replaceAll('_', ' ')}</small>
                  <Link className="goldButton compact" href={`/get-started?service=${service.id}`}>Choose this path →</Link>
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="commercialSafety">
        <div><div className="cinematicEyebrow goldText">READINESS ≠ APPROVAL</div><h2>Prepare first. Apply when the profile is stronger.</h2><p>Readiness scores and Ready-to-Shop status are educational planning gates. They do not represent lender underwriting, approval, rates or terms. Consumer billing remains subject to jurisdiction, service completion, contract status and applicable law.</p></div>
        <Link className="goldButton" href="/get-started">Open readiness assessment →</Link>
      </section>
    </main>
  );
}