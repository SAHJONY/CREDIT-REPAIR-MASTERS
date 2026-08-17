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
  const attribution = {
    source: params.utm_source || params.ref || 'direct',
    medium: params.utm_medium || '',
    campaign: params.utm_campaign || ''
  };

  return (
    <main>
      <header className="appHeader">
        <div>
          <div className="kicker">CREDIT REPAIR MASTERS / GET STARTED</div>
          <h1>Choose the right operating path.</h1>
          <p className="subtitle">Start with the service that matches your goal. Consumer credit work stays evidence-based and jurisdiction-gated; business advisory and the OS follow separate commercial rules.</p>
        </div>
        <div className="headerActions"><Link className="secondaryButton" href="/services">Pricing</Link><Link className="secondaryButton" href="/portal/sign-in">Existing client</Link></div>
      </header>

      {selected ? (
        <section className="grid" style={{ marginBottom: 14 }}>
          <div className="card span5">
            <div className="row">
              <div>
                <div className="label">Selected service</div>
                <h2>{selected.name}</h2>
                <div className="value">{price(selected)}</div>
                <p className="small">{selected.description}</p>
              </div>
              <span className="pill low">{selected.audience}</span>
            </div>
            <div style={{ marginTop: 12 }}>{selected.deliverables.map((item) => <div className="small" key={item}>• {item}</div>)}</div>
            <div className="guardrail" style={{ marginTop: 14 }}>
              {selected.audience === 'consumer'
                ? 'Consumer fees remain subject to service completion, contract status, cancellation timing, sales channel, and state law. No score increase or deletion outcome is guaranteed.'
                : selected.audience === 'business'
                  ? 'Business-credit advisory is separate from consumer credit repair and does not guarantee financing approval.'
                  : 'OS subscriptions are software access for credit professionals and agencies; customer compliance obligations remain with the operating organization.'}
            </div>
          </div>
          <div className="card span7">
            <LeadIntakeForm
              serviceId={selected.id}
              serviceName={selected.name}
              audience={selected.audience}
              source={attribution.source}
              medium={attribution.medium}
              campaign={attribution.campaign}
            />
          </div>
        </section>
      ) : null}

      <section className="grid">
        <div className="card span4">
          <div className="label">Personal credit</div>
          <h2>Consumer intelligence</h2>
          <p className="small">For consumers who want evidence-based report analysis, monitoring, or complex recovery case management.</p>
          {consumer.map((service) => <Link className="listRow" href={serviceHref(service.id, params)} key={service.id}><div><strong>{service.name}</strong><div className="small">{price(service)}</div></div><span>→</span></Link>)}
        </div>

        <div className="card span4">
          <div className="label">Business credit</div>
          <h2>Advisory</h2>
          <p className="small">For companies that need business-credit readiness, reporting strategy, or financing-readiness implementation.</p>
          {business.map((service) => <Link className="listRow" href={serviceHref(service.id, params)} key={service.id}><div><strong>{service.name}</strong><div className="small">{price(service)}</div></div><span>→</span></Link>)}
        </div>

        <div className="card span4">
          <div className="label">For professionals</div>
          <h2>CREDIT REPAIR MASTERS OS</h2>
          <p className="small">For operators and agencies that want the governed workflow, evidence ledger, AI analysis, client workspace, and audit trail.</p>
          {b2b.map((service) => <Link className="listRow" href={serviceHref(service.id, params)} key={service.id}><div><strong>{service.name}</strong><div className="small">{price(service)}</div></div><span>→</span></Link>)}
        </div>

        <div className="card span12">
          <div className="label">Secure onboarding</div>
          <h2>Qualification → activation → delivery → compliant billing</h2>
          <div className="grid">
            <div className="span3"><strong>1. Qualification</strong><p className="small">Capture service intent, state, source and permission to contact before operational work begins.</p></div>
            <div className="span3"><strong>2. Controlled activation</strong><p className="small">Approved customers receive tenant-scoped portal access. Staff and customer permissions remain isolated.</p></div>
            <div className="span3"><strong>3. Evidence-first execution</strong><p className="small">Reports, documents, authorizations, case actions, approvals and outcomes are tracked in the OS.</p></div>
            <div className="span3"><strong>4. Billing gate</strong><p className="small">Consumer collection stays blocked until the existing eligibility engine approves jurisdiction, timing and service status.</p></div>
          </div>
          <div className="headerActions" style={{ marginTop: 16 }}>
            <Link className="primaryButton" href="/services">Compare all services</Link>
            <Link className="secondaryButton" href="/portal/sign-in">Existing client sign in</Link>
          </div>
        </div>
      </section>
      <footer>Accurate negative information is not eligible for deletion simply because it is negative. CREDIT REPAIR MASTERS does not guarantee score increases, funding approvals, or removal of accurate information.</footer>
    </main>
  );
}
