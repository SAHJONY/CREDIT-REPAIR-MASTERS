import type { Route } from 'next';
import Link from 'next/link';

type SearchParams = Promise<{ utm_source?: string; utm_medium?: string; utm_campaign?: string; ref?: string }>;

function funnelHref(params: Awaited<SearchParams>, service?: string): Route {
  const query = new URLSearchParams();
  if (service) query.set('service', service);
  if (params.utm_source) query.set('utm_source', params.utm_source);
  if (params.utm_medium) query.set('utm_medium', params.utm_medium);
  if (params.utm_campaign) query.set('utm_campaign', params.utm_campaign);
  if (params.ref) query.set('ref', params.ref);
  const value = query.toString();
  return (value ? `/get-started?${value}` : '/get-started') as Route;
}

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;

  return (
    <main className="publicCinema">
      <nav className="publicCinemaNav">
        <div className="cinematicWordmark"><span>CRM</span><div><b>CREDIT REPAIR</b><small>MASTERS</small></div></div>
        <div className="publicCinemaLinks">
          <Link href="/services">Services</Link>
          <Link href="/portal/sign-in">Client Portal</Link>
          <Link href="/auth/sign-in">Staff</Link>
          <Link className="goldButton compact" href={funnelHref(params)}>Get Started</Link>
        </div>
      </nav>

      <section className="publicCinemaHero">
        <div className="publicCinemaImage" aria-hidden="true" />
        <div className="publicCinemaShade" />
        <div className="publicCinemaCopy">
          <div className="cinematicEyebrow">CREDIT INTELLIGENCE · PRIVATE CLIENT EXPERIENCE</div>
          <h1>Build the financial future<br/><em>you deserve.</em></h1>
          <p>Evidence-first credit intelligence, secure case management, business-credit readiness and governed AI workflows in one premium operating platform.</p>
          <div className="publicCinemaActions">
            <Link className="goldButton" href={funnelHref(params)}>Start your plan <span>→</span></Link>
            <Link className="glassButton" href="/services">Explore services</Link>
          </div>
        </div>
        <div className="publicCinemaTrust">
          <div><small>PRIVATE BY DESIGN</small><strong>Secure</strong><span>Tenant-isolated client records</span></div>
          <div><small>COMPLIANCE-FIRST</small><strong>Governed</strong><span>Policy-gated billing & actions</span></div>
          <div><small>CLIENT EXPERIENCE</small><strong>Premium</strong><span>Portal, progress & documents</span></div>
        </div>
      </section>

      <section className="publicCinemaCards">
        <Link href={funnelHref(params, 'credit-intelligence-audit')} className="publicCinemaCard blueCard"><span>PERSONAL CREDIT</span><h2>Credit Intelligence</h2><p>Analyze reports, organize evidence and prioritize the next steps in your improvement plan.</p><b>Start with an audit →</b></Link>
        <Link href={funnelHref(params, 'business-credit-accelerator')} className="publicCinemaCard violetCard"><span>BUSINESS CREDIT</span><h2>Capital Readiness</h2><p>Assess business profile quality, documentation, reporting strategy and funding readiness.</p><b>Explore business credit →</b></Link>
        <Link href={funnelHref(params, 'credit-os-professional')} className="publicCinemaCard emeraldCard"><span>FOR PROFESSIONALS</span><h2>Credit Masters OS</h2><p>Operate client work with evidence, approvals, private documents, compliance and AI workflows.</p><b>Explore the OS →</b></Link>
      </section>

      <section className="publicCinemaFuture">
        <div>
          <div className="cinematicEyebrow goldText">CONTROL · CLARITY · PROGRESS</div>
          <h2>One secure place for the entire journey.</h2>
          <p>Reports, authorizations, case work, documents, customer-safe progress and approved payments stay connected without exposing bureau credentials.</p>
          <Link className="glassButton" href="/portal/sign-in">Enter client portal →</Link>
        </div>
      </section>

      <footer className="publicCinemaFooter">Credit Repair Masters does not guarantee score increases, financing approvals, or deletion of accurate information. Consumer credit services remain subject to applicable federal and state requirements.</footer>
    </main>
  );
}