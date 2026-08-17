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

const metrics = [
  ['▣', 'Credit Reports', '3', 'Reports monitored', 'Experian · Equifax · TransUnion', '/portal/reports', 'View reports →'],
  ['◩', 'Items Under Review', '8', 'Active items', 'Evidence review & verification', '/portal/progress', 'View progress →'],
  ['⌁', 'Disputes In Progress', '5', 'Active disputes', 'Challenging potentially inaccurate items', '/portal/progress', 'View disputes →'],
  ['▤', 'Documents', '14', 'Available', 'Agreements, letters, reports', '/portal/documents', 'View documents →'],
  ['▱', 'Payments', '$0.00', 'No payment due', 'Approved invoices only', '/portal/payments', 'View billing →']
] as const;

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  return (
    <main className="referenceLanding">
      <header className="referenceTopbar">
        <Link className="referenceBrand" href="/">
          <span className="referenceCrest">CRM</span>
          <span className="referenceBrandText"><strong>CREDIT REPAIR</strong><small>MASTERS</small></span>
        </Link>
        <nav className="referenceNav" aria-label="Primary">
          <Link className="active" href="/">Home</Link><Link href="/services">Services</Link><Link href="/get-started">How It Works</Link><Link href="/portal/progress">Results</Link><Link href="/services">Pricing</Link><Link href="/portal">Education</Link><Link href="/services">About Us</Link>
        </nav>
        <div className="referenceActions"><Link className="referencePhone" href="/portal/sign-in">Client Portal</Link><Link className="referenceGetStarted" href={funnelHref(params)}>Get Started</Link></div>
      </header>

      <div className="referenceContent">
        <section className="referenceHero">
          <div className="referenceHeroImage" aria-hidden="true" />
          <div className="referenceHeroCopy">
            <span className="referencePill">TAKE CONTROL OF YOUR FUTURE</span>
            <h1>We Repair Credit.<span>You Build Dreams.</span></h1>
            <p>Evidence-first credit intelligence, secure dispute workflows and a private client experience designed to help you build a stronger financial profile.</p>
            <div className="referenceHeroButtons"><Link className="referencePrimary" href={funnelHref(params)}>Get Started Now <span>→</span></Link><Link className="referenceSecondary" href="/portal/sign-in">View Your Progress</Link></div>
          </div>
          <aside className="referenceHealth">
            <h3>Example Credit Health</h3>
            <div className="referenceHealthScore"><div><strong>648</strong><small>Good</small></div></div>
            <div className="referenceHealthMeta"><b>Target: 700+</b><span>Illustrative dashboard preview</span></div>
          </aside>
        </section>

        <section className="referenceMetricGrid">
          {metrics.map(([icon,title,value,label,detail,href,cta]) => <Link className="referenceMetric" href={href} key={title}><div className="referenceMetricHead"><span className="referenceMetricIcon">{icon}</span>{title}</div><strong>{value}</strong><small>{label}</small><small>{detail}</small><b>{cta}</b></Link>)}
        </section>

        <section className="referenceLower">
          <div className="referencePanel">
            <div className="referencePanelInner"><h3>Progress Overview</h3><div className="referenceTimeline">
              <div className="referenceTimelineStep done"><i>✓</i><b>Account</b><small>Activated</small></div>
              <div className="referenceTimelineStep done"><i>✓</i><b>Reports</b><small>Received</small></div>
              <div className="referenceTimelineStep done"><i>✓</i><b>Analysis</b><small>Completed</small></div>
              <div className="referenceTimelineStep current"><i>4</i><b>Disputes</b><small>In progress</small></div>
              <div className="referenceTimelineStep"><i>5</i><b>Results</b><small>Review</small></div>
              <div className="referenceTimelineStep"><i>6</i><b>Next Cycle</b><small>Optimization</small></div>
            </div></div>
            <div className="referenceAspirational"><div className="referencePanelInner"><span className="referencePill">BUILD WHAT COMES NEXT</span><h2>A Better Credit Profile Can Expand Your Options.</h2><ul><li>Potentially stronger financing terms</li><li>Improved borrowing readiness</li><li>More control over your financial plan</li><li>A documented path forward</li></ul><Link className="referencePrimary" href={funnelHref(params)}>Explore Your Plan →</Link></div></div>
          </div>

          <div className="referencePanel referenceAspirational"><div className="referencePanelInner"><span className="referencePill">PRIVATE CLIENT EXPERIENCE</span><h2>One Secure Place For Your Entire Journey.</h2><p>Reports, authorizations, documents, case activity and approved payments stay connected in a single governed workspace.</p><Link className="referencePrimary" href="/portal/sign-in">Enter Client Portal →</Link></div></div>

          <div className="referenceSideStack">
            <div className="referencePanel referenceQuote"><h3>Built for Clarity</h3><div className="stars">★★★★★</div><p>Track documents, reports, authorizations, dispute activity and approved billing from one private portal.</p><small>No score increase, deletion or financing outcome is guaranteed.</small></div>
            <div className="referencePanel referenceEducation"><h3>Financial Education</h3><div className="referenceArticle"><div className="referenceArticleVisual"/><div><b>How Utilization Affects Your Credit Profile</b><span>Understand one of the most important revolving-credit metrics.</span></div></div><div className="referenceArticle"><div className="referenceArticleVisual"/><div><b>Preparing for Home Financing</b><span>Organize your profile and documents before you apply.</span></div></div></div>
          </div>
        </section>

        <section className="referencePromise"><div><b>Secure & Confidential</b><small>Private customer records and controlled access</small></div><div><b>Compliance-First</b><small>Actions and billing remain policy-gated</small></div><div><b>Evidence-Based</b><small>Documented analysis and workflow history</small></div><div><b>Human + AI Operations</b><small>Automation with governed review points</small></div></section>
        <footer className="referenceFooter">Credit Repair Masters does not guarantee score increases, financing approvals, or deletion of accurate information. Services remain subject to applicable federal and state requirements.</footer>
      </div>
    </main>
  );
}