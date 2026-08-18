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
  ['◎', 'Approval Readiness', '0–100', 'Explainable score', 'Measure blockers before you apply', '/loan-readiness', 'Explore readiness →'],
  ['▣', 'Credit Reports', '3', 'Reports monitored', 'Experian · Equifax · TransUnion', '/portal/reports', 'View reports →'],
  ['◩', 'Items Under Review', '8', 'Active items', 'Evidence review & verification', '/portal/progress', 'View progress →'],
  ['▤', 'Documents', '14', 'Available', 'Agreements, letters, reports', '/portal/documents', 'View documents →'],
  ['▱', 'Payments', '$0.00', 'No payment due', 'Approved invoices only', '/portal/payments', 'View billing →']
] as const;

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  return (
    <main className="referenceLanding">
      <header className="referenceTopbar">
        <Link className="referenceBrand" href="/">
          <span className="referenceCrest">CRM</span>{' '}
          <span className="referenceBrandText">
            <strong>CREDIT REPAIR</strong>{' '}
            <small>MASTERS</small>
          </span>
        </Link>

        <nav className="referenceNav" aria-label="Primary">
          <Link className="active" href="/">Home</Link>{' '}
          <Link href="/services">Services</Link>{' '}
          <Link href="/get-started">How It Works</Link>{' '}
          <Link href="/loan-readiness">Readiness</Link>{' '}
          <Link href="/services">Pricing</Link>{' '}
          <Link href="/portal">Education</Link>{' '}
          <Link href="/services">About Us</Link>
        </nav>

        <div className="referenceActions">
          <Link className="referencePhone" href="/portal/sign-in">Client Portal</Link>{' '}
          <Link className="referenceGetStarted" href={funnelHref(params)}>Check Your Readiness</Link>
        </div>
      </header>

      <div className="referenceContent">
        <section className="referenceHero">
          <div className="referenceHeroImage" aria-hidden="true" />
          <div className="referenceHeroCopy">
            <span className="referencePill">CREDIT-TO-APPROVAL READINESS PLATFORM</span>
            <h1>
              Know What Is Holding You Back.{' '}
              <span>Apply Better Prepared.</span>
            </h1>
            <p>Measure the credit, debt, payment, inquiry and reserve factors affecting your next financing goal. Then follow a quantified plan designed to improve the factors you can control before you shop for credit.</p>
            <div className="referenceHeroButtons">
              <Link className="referencePrimary" href={funnelHref(params)}>Check Your Readiness <span>→</span></Link>{' '}
              <Link className="referenceSecondary" href="/portal/sign-in">Track Your Progress</Link>
            </div>
          </div>

          <aside className="referenceHealth">
            <h3>Example Approval Readiness</h3>
            <div className="referenceHealthScore">
              <div><strong>76</strong>{' '}<small>Building</small></div>
            </div>
            <div className="referenceHealthMeta">
              <b>Target: 85+ and zero P0 blockers</b>{' '}
              <span>Illustrative planning score · not a lender decision</span>
            </div>
          </aside>
        </section>

        <section className="referenceMetricGrid">
          {metrics.map(([icon, title, value, label, detail, href, cta]) => (
            <Link className="referenceMetric" href={href} key={title}>
              <div className="referenceMetricHead"><span className="referenceMetricIcon">{icon}</span>{' '}{title}</div>
              <strong>{value}</strong>{' '}
              <small>{label}</small>{' '}
              <small>{detail}</small>{' '}
              <b>{cta}</b>
            </Link>
          ))}
        </section>

        <section className="referenceLower">
          <div className="referencePanel">
            <div className="referencePanelInner">
              <h3>Your Readiness Journey</h3>
              <div className="referenceTimeline">
                <div className="referenceTimelineStep done"><i>✓</i>{' '}<b>Goal</b>{' '}<small>Defined</small></div>
                <div className="referenceTimelineStep done"><i>✓</i>{' '}<b>Profile</b>{' '}<small>Measured</small></div>
                <div className="referenceTimelineStep done"><i>✓</i>{' '}<b>Blockers</b>{' '}<small>Prioritized</small></div>
                <div className="referenceTimelineStep current"><i>4</i>{' '}<b>Action Plan</b>{' '}<small>In progress</small></div>
                <div className="referenceTimelineStep"><i>5</i>{' '}<b>Reassess</b>{' '}<small>Measure delta</small></div>
                <div className="referenceTimelineStep"><i>6</i>{' '}<b>Ready to Shop</b>{' '}<small>Planning gate</small></div>
              </div>
            </div>

            <div className="referenceAspirational">
              <div className="referencePanelInner">
                <span className="referencePill">MEASURE → IMPROVE → REASSESS</span>
                <h2>Turn Credit Improvement Into Application Readiness.</h2>
                <ul>
                  <li>Identify the highest-impact blockers first</li>
                  <li>Build measurable 7/30/60/90-day actions</li>
                  <li>Track progress against your financing goal</li>
                  <li>Shop for credit only when your profile is better prepared</li>
                </ul>
                <Link className="referencePrimary" href={funnelHref(params)}>Build Your Readiness Plan →</Link>
              </div>
            </div>
          </div>

          <div className="referencePanel referenceAspirational">
            <div className="referencePanelInner">
              <span className="referencePill">ONE GOVERNED WORKSPACE</span>
              <h2>From Credit Problem To Financial Readiness.</h2>
              <p>Reports, evidence, authorizations, readiness assessments, action plans, progress and approved payments stay connected in one secure workspace.</p>
              <Link className="referencePrimary" href="/portal/sign-in">Enter Client Portal →</Link>
            </div>
          </div>

          <div className="referenceSideStack">
            <div className="referencePanel referenceQuote">
              <h3>Built for Better Decisions</h3>
              <div className="stars">★★★★★</div>
              <p>Understand what is limiting your profile, what to address next, and whether you are better prepared than at your last assessment.</p>
              <small>Readiness scores are planning tools. No score increase, deletion, financing approval, rate or lender outcome is guaranteed.</small>
            </div>

            <div className="referencePanel referenceEducation">
              <h3>Financial Education</h3>
              <div className="referenceArticle">
                <div className="referenceArticleVisual" />
                <div><b>How Utilization Affects Approval Readiness</b>{' '}<span>Understand one of the highest-impact revolving-credit metrics.</span></div>
              </div>
              <div className="referenceArticle">
                <div className="referenceArticleVisual" />
                <div><b>Preparing Before You Apply</b>{' '}<span>Organize credit, debt, reserves and documents before financial shopping.</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="referencePromise">
          <div><b>Explainable Readiness</b>{' '}<small>Know which factors drive your score</small></div>
          <div><b>Compliance-First</b>{' '}<small>Actions and billing remain policy-gated</small></div>
          <div><b>Evidence-Based</b>{' '}<small>Documented analysis and measurable progress</small></div>
          <div><b>Ready-to-Shop Gate</b>{' '}<small>A planning threshold, never an approval promise</small></div>
        </section>

        <footer className="referenceFooter">Credit Repair Masters provides credit education, readiness modeling and governed credit-services workflows. Readiness scores are planning tools and do not represent lender underwriting. We do not guarantee score increases, financing approvals, rates, terms, or deletion of accurate information. Services remain subject to applicable federal and state requirements.</footer>
      </div>
    </main>
  );
}
