import type { Route } from 'next';
import Link from 'next/link';
import { LeadIntakeForm } from '@/components/lead-intake-form';
import { commercialServices, getCommercialService } from '@/lib/service-catalog';

type SearchParams = Promise<{
  service?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  ref?: string;
}>;

function money(cents?: number) {
  if (cents == null) return 'Custom';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100);
}

function price(service: (typeof commercialServices)[number]) {
  if (service.priceRangeCents) return `${money(service.priceRangeCents[0])}–${money(service.priceRangeCents[1])}`;
  const amount = money(service.priceCents);
  return service.billingModel === 'monthly' ? `${amount}/mo` : amount;
}

function serviceHref(serviceId: string, params: Awaited<SearchParams>): Route {
  const query = new URLSearchParams({ service: serviceId });
  if (params.utm_source) query.set('utm_source', params.utm_source);
  if (params.utm_medium) query.set('utm_medium', params.utm_medium);
  if (params.utm_campaign) query.set('utm_campaign', params.utm_campaign);
  if (params.ref) query.set('ref', params.ref);
  return `/get-started?${query.toString()}` as Route;
}

export default async function GetStartedPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const selected = params.service ? getCommercialService(params.service) : null;
  const consumer = commercialServices.filter((service) => service.audience === 'consumer');
  const business = commercialServices.filter((service) => service.audience === 'business');
  const b2b = commercialServices.filter((service) => service.audience === 'b2b');
  const attribution = { source: params.utm_source || params.ref || 'direct', medium: params.utm_medium || '', campaign: params.utm_campaign || '' };

  return (
    <main className="onboardingCinema">
      <section className="onboardingHero">
        <div className="onboardingHeroImage" aria-hidden="true" />
        <div className="onboardingHeroShade" />
        <div className="onboardingHeroCopy">
          <div className="cinematicEyebrow">CREDIT REPAIR MASTERS · CREDIT-TO-APPROVAL READINESS</div>
          <h1>Start with the goal.<br/><em>Measure what stands in the way.</em></h1>
          <p>Choose the path that matches what you are preparing to apply for. We measure controllable readiness factors, identify blockers and build a documented plan before financial shopping.</p>
          <div className="publicCinemaActions"><Link className="glassButton" href="/services">Compare readiness services</Link><Link className="glassButton" href="/portal/sign-in">Existing client</Link></div>
        </div>
      </section>

      {selected ? (
        <section className="onboardingSelected">
          <div className="onboardingSelectedSummary">
            <div className="cinematicEyebrow goldText">SELECTED READINESS PATH</div>
            <span className="pill low">{selected.audience}</span>
            <h2>{selected.name}</h2>
            <strong>{price(selected)}</strong>
            <p>{selected.description}</p>
            <div className="commercialDeliverables">{selected.deliverables.map((item) => <div key={item}>✓ {item}</div>)}</div>
            <div className="guardrail">
              {selected.audience === 'consumer'
                ? 'Consumer services measure and improve readiness factors; they do not guarantee score increases, deletion outcomes, financing approval, rates or terms. Fees remain subject to service completion, contract status, cancellation timing, sales channel, and state law.'
                : selected.audience === 'business'
                  ? 'Business-credit readiness advisory is separate from consumer credit repair and does not guarantee funding or financing approval.'
                  : 'OS subscriptions provide governed readiness and credit-operations software; each operating organization remains responsible for its own customer compliance obligations.'}
            </div>
          </div>
          <div className="onboardingFormGlass">
            <LeadIntakeForm serviceId={selected.id} serviceName={selected.name} audience={selected.audience} source={attribution.source} medium={attribution.medium} campaign={attribution.campaign} />
          </div>
        </section>
      ) : null}

      <section className="onboardingPaths">
        <div className="onboardingPath blue"><div className="cinematicEyebrow">PERSONAL CREDIT</div><h2>Approval readiness</h2><p>Credit intelligence, blocker analysis, measurable action planning and governed recovery support tied to the client&apos;s financing goal.</p>{consumer.map((service) => <Link className="cinemaListRow" href={serviceHref(service.id, params)} key={service.id}><div><strong>{service.name}</strong><span>{price(service)}</span></div><b>→</b></Link>)}</div>
        <div className="onboardingPath emerald"><div className="cinematicEyebrow">BUSINESS CREDIT</div><h2>Funding readiness</h2><p>Business profile, reporting, documentation and financing-readiness implementation without promising approval.</p>{business.map((service) => <Link className="cinemaListRow" href={serviceHref(service.id, params)} key={service.id}><div><strong>{service.name}</strong><span>{price(service)}</span></div><b>→</b></Link>)}</div>
        <div className="onboardingPath violet"><div className="cinematicEyebrow">FOR PROFESSIONALS</div><h2>Approval Readiness OS</h2><p>Governed workflow, explainable scoring, evidence ledger, client workspace, AI analysis and audit trail for credit professionals and agencies.</p>{b2b.map((service) => <Link className="cinemaListRow" href={serviceHref(service.id, params)} key={service.id}><div><strong>{service.name}</strong><span>{price(service)}</span></div><b>→</b></Link>)}</div>
      </section>

      <section className="onboardingJourney"><div><div className="cinematicEyebrow goldText">READINESS JOURNEY</div><h2>Goal → assessment → blockers → action plan → reassessment → Ready to Shop</h2></div><div className="journeyGrid"><div><b>01</b><strong>Define the goal</strong><span>Mortgage, auto, card, personal loan, business credit, lease or financed purchase.</span></div><div><b>02</b><strong>Measure readiness</strong><span>Evaluate credit profile, utilization, payment history, DTI, inquiries, derogatories and reserves.</span></div><div><b>03</b><strong>Improve controllable factors</strong><span>Prioritize P0/P1/P2 blockers through evidence-based 7/30/60/90-day actions.</span></div><div><b>04</b><strong>Shop when better prepared</strong><span>Ready to Shop is a planning gate, never a lender approval or rate guarantee.</span></div></div></section>
      <footer>Readiness scores are educational planning tools, not lender underwriting. Accurate negative information is not eligible for deletion simply because it is negative. CREDIT REPAIR MASTERS does not guarantee score increases, funding approvals, rates, terms, or removal of accurate information.</footer>
    </main>
  );
}