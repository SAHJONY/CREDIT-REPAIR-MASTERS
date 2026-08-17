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
    <main className="onboardingCinema onboardingV72">
      <section className="onboardingCommandHero">
        <div className="onboardingCommandCopy">
          <div className="cinematicEyebrow">CREDIT REPAIR MASTERS · PRIVATE ONBOARDING</div>
          <h1>Choose the path<br/><em>built for your goal.</em></h1>
          <p>One secure entry point for personal credit intelligence, business-credit advisory, and professional operating software.</p>
          <div className="onboardingTrustRow">
            <span>✓ Secure intake</span><span>✓ Jurisdiction-aware</span><span>✓ No score guarantees</span>
          </div>
          <div className="publicCinemaActions">
            <Link className="goldButton" href="#paths">Choose your path</Link>
            <Link className="glassButton" href="/portal/sign-in">Existing client</Link>
          </div>
        </div>
        <div className="onboardingCommandPanel">
          <div className="onboardingCommandTop"><span>PRIVATE CLIENT INTAKE</span><b>SECURE</b></div>
          <div className="onboardingCommandMetric"><small>PATHS AVAILABLE</small><strong>3</strong><span>Personal · Business · Professional</span></div>
          <div className="onboardingCommandSteps">
            <div className="done"><i>1</i><p><b>Select your goal</b><span>Choose the service path that fits you.</span></p></div>
            <div><i>2</i><p><b>Complete qualification</b><span>Provide only the information required.</span></p></div>
            <div><i>3</i><p><b>Activate securely</b><span>Access your private workspace.</span></p></div>
          </div>
          <div className="onboardingCommandFooter">Consumer billing remains controlled by eligibility and compliance gates.</div>
        </div>
      </section>

      {selected ? (
        <section className="onboardingSelected">
          <div className="onboardingSelectedSummary">
            <div className="cinematicEyebrow goldText">SELECTED SERVICE</div>
            <span className="pill low">{selected.audience}</span>
            <h2>{selected.name}</h2>
            <strong>{price(selected)}</strong>
            <p>{selected.description}</p>
            <div className="commercialDeliverables">{selected.deliverables.map((item) => <div key={item}>✓ {item}</div>)}</div>
            <div className="guardrail">
              {selected.audience === 'consumer'
                ? 'Consumer fees remain subject to service completion, contract status, cancellation timing, sales channel, and state law. No score increase or deletion outcome is guaranteed.'
                : selected.audience === 'business'
                  ? 'Business-credit advisory is separate from consumer credit repair and does not guarantee financing approval.'
                  : 'OS subscriptions are software access for credit professionals and agencies; customer compliance obligations remain with the operating organization.'}
            </div>
          </div>
          <div className="onboardingFormGlass">
            <LeadIntakeForm serviceId={selected.id} serviceName={selected.name} audience={selected.audience} source={attribution.source} medium={attribution.medium} campaign={attribution.campaign} />
          </div>
        </section>
      ) : null}

      <section className="onboardingPaths" id="paths">
        <div className="onboardingPath blue"><div className="pathIcon">◎</div><div className="cinematicEyebrow">PERSONAL CREDIT</div><h2>Consumer intelligence</h2><p>Evidence-based report analysis, monitoring and complex recovery case management.</p>{consumer.map((service) => <Link className="cinemaListRow" href={serviceHref(service.id, params)} key={service.id}><div><strong>{service.name}</strong><span>{price(service)}</span></div><b>→</b></Link>)}</div>
        <div className="onboardingPath emerald"><div className="pathIcon">◇</div><div className="cinematicEyebrow">BUSINESS CREDIT</div><h2>Advisory</h2><p>Business-credit readiness, reporting strategy and financing-readiness implementation.</p>{business.map((service) => <Link className="cinemaListRow" href={serviceHref(service.id, params)} key={service.id}><div><strong>{service.name}</strong><span>{price(service)}</span></div><b>→</b></Link>)}</div>
        <div className="onboardingPath violet"><div className="pathIcon">▦</div><div className="cinematicEyebrow">FOR PROFESSIONALS</div><h2>CREDIT REPAIR MASTERS OS</h2><p>Governed workflow, evidence ledger, AI analysis, client workspace and audit trail.</p>{b2b.map((service) => <Link className="cinemaListRow" href={serviceHref(service.id, params)} key={service.id}><div><strong>{service.name}</strong><span>{price(service)}</span></div><b>→</b></Link>)}</div>
      </section>

      <section className="onboardingJourney"><div><div className="cinematicEyebrow goldText">SECURE ONBOARDING</div><h2>Qualification → activation → delivery → compliant billing</h2></div><div className="journeyGrid"><div><b>01</b><strong>Qualification</strong><span>Capture service intent, state, source and contact permission.</span></div><div><b>02</b><strong>Controlled activation</strong><span>Tenant-scoped access keeps staff and customer permissions isolated.</span></div><div><b>03</b><strong>Evidence-first execution</strong><span>Reports, documents, authorizations and outcomes stay in the OS.</span></div><div><b>04</b><strong>Billing gate</strong><span>Collection remains blocked until the eligibility engine approves it.</span></div></div></section>
      <footer>Accurate negative information is not eligible for deletion simply because it is negative. CREDIT REPAIR MASTERS does not guarantee score increases, funding approvals, or removal of accurate information.</footer>
    </main>
  );
}