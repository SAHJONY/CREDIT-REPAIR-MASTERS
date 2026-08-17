import Link from 'next/link';

type SearchParams = Promise<{ utm_source?: string; utm_medium?: string; utm_campaign?: string; ref?: string }>;

function funnelHref(params: Awaited<SearchParams>, service?: string) {
  const query = new URLSearchParams();
  if (service) query.set('service', service);
  if (params.utm_source) query.set('utm_source', params.utm_source);
  if (params.utm_medium) query.set('utm_medium', params.utm_medium);
  if (params.utm_campaign) query.set('utm_campaign', params.utm_campaign);
  if (params.ref) query.set('ref', params.ref);
  const value = query.toString();
  return value ? `/get-started?${value}` : '/get-started';
}

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;

  return (
    <main>
      <header className="appHeader">
        <div>
          <div className="kicker">CREDIT REPAIR MASTERS</div>
          <h1>Evidence-first credit intelligence for consumers, businesses, and professionals.</h1>
          <p className="subtitle">A secure credit operations platform for report analysis, documented case work, business-credit readiness, and governed AI workflows—without sharing bureau passwords or promising impossible deletions.</p>
        </div>
        <div className="headerActions"><Link className="primaryButton" href={funnelHref(params)}>Get started</Link><Link className="secondaryButton" href="/services">Services & pricing</Link><Link className="secondaryButton" href="/portal/sign-in">Client sign in</Link><Link className="secondaryButton" href="/auth/sign-in">Staff sign in</Link></div>
      </header>

      <section className="grid">
        <div className="card span4"><div className="label">Personal credit</div><h2>Consumer intelligence</h2><p className="small">Normalize reports, identify potentially inaccurate or unsupported reporting, organize evidence, monitor responses, and build a prioritized improvement plan.</p><div className="headerActions" style={{ marginTop: 14 }}><Link className="primaryButton" href={funnelHref(params, 'credit-intelligence-audit')}>Start with an audit</Link></div></div>
        <div className="card span4"><div className="label">Business credit</div><h2>Readiness & advisory</h2><p className="small">Assess business profile quality, documentation readiness, reporting strategy, funding readiness, and implementation milestones.</p><div className="headerActions" style={{ marginTop: 14 }}><Link className="primaryButton" href={funnelHref(params, 'business-credit-accelerator')}>Explore business credit</Link></div></div>
        <div className="card span4"><div className="label">For professionals</div><h2>CREDIT REPAIR MASTERS OS</h2><p className="small">Operate client work with a tenant-scoped evidence ledger, AI analysis, compliance workflow, approvals, audit trail, private documents, and client portal.</p><div className="headerActions" style={{ marginTop: 14 }}><Link className="primaryButton" href={funnelHref(params, 'credit-os-professional')}>Explore the OS</Link></div></div>

        <div className="card span4"><div className="label">1. Get official reports</div><h2>Consumer-controlled intake</h2><p className="small">Use official free disclosure sources or bureau channels directly. Authentication remains between the consumer and the reporting company.</p></div>
        <div className="card span4"><div className="label">2. Upload privately</div><h2>Evidence Vault</h2><p className="small">Credit reports and supporting documents are stored privately and linked only to the authorized tenant and client profile.</p></div>
        <div className="card span4"><div className="label">3. Execute safely</div><h2>Policy-gated workflow</h2><p className="small">Evidence, consent, jurisdiction, billing eligibility, approvals, customer-safe progress, and agent actions stay inside one controlled operating system.</p></div>

        <div className="card span12">
          <div className="row">
            <div><div className="label">Security & governance</div><h2>AI can analyze and propose. It cannot invent evidence or bypass authorization.</h2><div className="guardrail">Customer access is isolated by tenant and client. Accurate negative information is not treated as disputable merely because it is negative. Sensitive external actions remain policy- and approval-gated.</div></div>
            <Link className="primaryButton" href={funnelHref(params)}>Choose my path</Link>
          </div>
        </div>
      </section>
      <footer>Credit Repair Masters does not guarantee score increases, financing approvals, or deletion of accurate information. Consumer credit services remain subject to applicable federal and state requirements.</footer>
    </main>
  );
}
