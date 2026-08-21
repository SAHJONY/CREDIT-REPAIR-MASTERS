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

const goalPaths = [
  { label: 'BUY A HOME', title: 'Mortgage readiness', detail: 'Credit, DTI, reserves and document preparation before mortgage shopping.', serviceId: 'mortgage-ready-90' },
  { label: 'BUY A VEHICLE', title: 'Auto financing readiness', detail: 'Affordability, down-payment planning, credit blockers and application timing.', serviceId: 'auto-loan-ready' },
  { label: 'PERSONAL FINANCING', title: 'Loan & credit readiness', detail: 'Understand the blockers affecting a personal loan, credit card or financed purchase.', serviceId: 'approval-blueprint' },
  { label: 'BUSINESS FUNDING', title: 'Business funding readiness', detail: 'Prepare business profile, documentation, reporting and funding milestones.', serviceId: 'business-credit-accelerator' },
  { label: 'RECOVER FROM DENIAL', title: 'Denial recovery plan', detail: 'Turn adverse-action reasons into a prioritized recovery and reapplication roadmap.', serviceId: 'denial-rescue' }
] as const;

export default async function GetStartedPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const selected = params.service ? getCommercialService(params.service) : null;
  const attribution = { source: params.utm_source || params.ref || 'direct', medium: params.utm_medium || '', campaign: params.utm_campaign || '' };

  return (
    <main className="onboardingCinema">
      <section className="onboardingHero">
        <div className="onboardingHeroImage" aria-hidden="true" />
        <div className="onboardingHeroShade" />
        <div className="onboardingHeroCopy">
          <div className="cinematicEyebrow">NEW850.COM · FINANCIAL READINESS</div>
          <h1>Start with what you want.<br/><em>We&apos;ll help measure what stands in the way.</em></h1>
          <p>Choose your financing goal first. New850 measures controllable readiness factors, identifies blockers and builds a documented plan before you shop for financial products.</p>
          <div className="publicCinemaActions"><Link className="glassButton" href="/loan-readiness">How readiness works</Link><Link className="glassButton" href="/portal/sign-in">Existing client</Link></div>
        </div>
      </section>

      {selected ? (
        <section className="onboardingSelected">
          <div className="onboardingSelectedSummary">
            <div className="cinematicEyebrow goldText">YOUR RECOMMENDED STARTING PATH</div>
            <span className="pill low">{selected.audience}</span>
            <h2>{selected.name}</h2>
            <strong>{price(selected)}</strong>
            <p>{selected.description}</p>
            <div className="commercialDeliverables">{selected.deliverables.map((item) => <div key={item}>✓ {item}</div>)}</div>
            <div className="guardrail">
              {selected.audience === 'consumer'
                ? 'New850 readiness services measure and improve planning factors; they do not guarantee score increases, deletion outcomes, financing approval, rates or terms. Fees remain subject to service completion, contract status, cancellation timing, sales channel and state law.'
                : selected.audience === 'business'
                  ? 'Business funding-readiness advisory is separate from consumer credit services and does not guarantee funding or financing approval.'
                  : 'New850 OS subscriptions provide governed readiness software; each operating organization remains responsible for its own customer compliance obligations.'}
            </div>
            <div className="headerActions"><Link className="secondaryButton" href="/get-started">Choose a different goal</Link><Link className="secondaryButton" href="/services">See all services</Link></div>
          </div>
          <div className="onboardingFormGlass">
            <LeadIntakeForm serviceId={selected.id} serviceName={selected.name} audience={selected.audience} source={attribution.source} medium={attribution.medium} campaign={attribution.campaign} />
          </div>
        </section>
      ) : (
        <section className="onboardingPaths">
          {goalPaths.map((goal) => (
            <div className="onboardingPath blue" key={goal.serviceId}>
              <div className="cinematicEyebrow">{goal.label}</div>
              <h2>{goal.title}</h2>
              <p>{goal.detail}</p>
              <Link className="primaryButton" href={serviceHref(goal.serviceId, params)}>Check this goal →</Link>
            </div>
          ))}
          <div className="onboardingPath emerald">
            <div className="cinematicEyebrow">NOT SURE WHERE TO START?</div>
            <h2>Use the universal readiness blueprint.</h2>
            <p>Start with one flexible assessment when your goal does not fit neatly into a category or you are comparing more than one future financing need.</p>
            <Link className="primaryButton" href={serviceHref('approval-blueprint', params)}>Start universal readiness →</Link>
          </div>
        </section>
      )}

      <section className="onboardingJourney">
        <div><div className="cinematicEyebrow goldText">READINESS JOURNEY</div><h2>Goal → assessment → blockers → action plan → reassessment → Ready to Shop</h2></div>
        <div className="journeyGrid">
          <div><b>01</b><strong>Define the goal</strong><span>Mortgage, auto, card, personal loan, business funding, lease or financed purchase.</span></div>
          <div><b>02</b><strong>Measure readiness</strong><span>Evaluate credit profile, utilization, payment history, DTI, inquiries, derogatories and reserves.</span></div>
          <div><b>03</b><strong>Improve controllable factors</strong><span>Prioritize P0/P1/P2 blockers through evidence-based 7/30/60/90-day actions.</span></div>
          <div><b>04</b><strong>Shop when better prepared</strong><span>Ready to Shop is a planning gate, never a lender approval or rate guarantee.</span></div>
        </div>
      </section>
      <footer>A New850 Readiness Score is an educational planning tool, not a credit score or lender underwriting score. New850.com does not guarantee score increases, funding approvals, rates, terms, or removal of accurate information.</footer>
    </main>
  );
}
