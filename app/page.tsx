import type { Route } from 'next';
import Link from 'next/link';
import { CinematicPhoto } from '@/components/cinematic-photo';

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

const outcomeOffers = [
  ['⌂', 'Buy a Home', 'Mortgage Ready 90', '$599', 'Prepare credit, DTI, reserves and documents before mortgage shopping.', 'mortgage-ready-90'],
  ['◈', 'Buy a Car', 'Auto Loan Ready', '$149', 'Know your blockers, affordability range and application timing before the dealership.', 'auto-loan-ready'],
  ['↗', 'Get Business Funding', 'Business Credit Accelerator', '$799', 'Organize the business profile, documentation and funding-readiness milestones.', 'business-credit-accelerator'],
  ['!', 'Recover From a Denial', 'Denial Rescue Analysis', '$199', 'Turn an adverse-action outcome into a prioritized recovery and reapplication plan.', 'denial-rescue']
] as const;

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
          <span className="referenceCrest">850</span>{' '}
          <span className="referenceBrandText"><strong>NEW850.COM</strong>{' '}<small>FINANCIAL READINESS</small></span>
        </Link>
        <nav className="referenceNav" aria-label="Primary">
          <Link className="active" href="/">Home</Link>{' '}<Link href="/loans">Loans</Link>{' '}<Link href="/auto">Auto</Link>{' '}<Link href="/mortgage">Home</Link>{' '}<Link href="/business-funding">Business</Link>{' '}<Link href="/marketplace">Marketplace</Link>{' '}<Link href="/get-started">Readiness</Link>
        </nav>
        <div className="referenceActions"><Link className="referencePhone" href="/portal/sign-in">Client Portal</Link>{' '}<Link className="referenceGetStarted" href={funnelHref(params, 'approval-blueprint')}>Check Your Readiness</Link></div>
      </header>

      <div className="referenceContent">
        <section className="referenceHero">
          <div className="referenceHeroImage" aria-hidden="true" />
          <div className="referenceHeroCopy">
            <span className="referencePill">FINANCIAL READINESS & APPROVAL PREPARATION PLATFORM</span>
            <h1>Know what&apos;s holding you back. <span>Apply better prepared.</span></h1>
            <p>Measure the credit, debt, payment, inquiry and reserve factors affecting your next financing goal. Then follow a quantified plan designed to improve the factors you can control before you shop for credit.</p>
            <div className="referenceHeroButtons"><Link className="referencePrimary" href={funnelHref(params, 'approval-blueprint')}>Get Your Approval Blueprint <span>→</span></Link>{' '}<Link className="referenceSecondary" href="/marketplace">Explore Marketplace</Link></div>
          </div>
          <aside className="referenceHealth">
            <h3>Example Approval Readiness</h3><div className="referenceHealthScore"><div><strong>76</strong>{' '}<small>Building</small></div></div><div className="referenceHealthMeta"><b>Target: 85+ and zero P0 blockers</b>{' '}<span>Illustrative planning score · not a lender decision</span></div>
          </aside>
        </section>

        <section className="referenceGoalSection" aria-labelledby="goal-heading">
          <div className="referenceGoalIntro"><span className="referencePill">START WITH WHAT YOU WANT TO FINANCE</span><h2 id="goal-heading">Choose Your Approval Goal.</h2><p>One readiness engine, four high-intent paths. Each path turns your current profile into measurable blockers, target thresholds and a next-action plan.</p></div>
          <div className="referenceGoalGrid">
            {outcomeOffers.map(([icon, goal, offer, price, detail, serviceId]) => <Link className="referenceGoalCard" href={funnelHref(params, serviceId)} key={serviceId}><span className="referenceGoalIcon">{icon}</span><small>{goal}</small><h3>{offer}</h3><strong>{price}</strong><p>{detail}</p><b>Start this path →</b></Link>)}
          </div>
        </section>

        <section className="pageVisualBand">
          <div><span className="referencePill">ONE PROFILE · MULTIPLE GOALS</span><h2>Your financial life should connect.</h2><p>New850 organizes readiness for loans, vehicles, mortgages and business funding around one reusable financial profile, while keeping each goal-specific assessment separate and explainable.</p><div className="referenceHeroButtons"><Link className="referencePrimary" href="/portal/passport">Explore Financial Passport →</Link><Link className="referenceSecondary" href="/marketplace">View marketplace</Link></div></div>
          <CinematicPhoto variant="horizon" label="A clear path toward financial readiness" />
        </section>

        <section className="referenceMetricGrid">
          {metrics.map(([icon, title, value, label, detail, href, cta]) => <Link className="referenceMetric" href={href} key={title}><div className="referenceMetricHead"><span className="referenceMetricIcon">{icon}</span>{' '}{title}</div><strong>{value}</strong>{' '}<small>{label}</small>{' '}<small>{detail}</small>{' '}<b>{cta}</b></Link>)}
        </section>

        <section className="pageVisualBand">
          <CinematicPhoto variant="mobility" label="Confident mobility and financial progress" />
          <div><span className="referencePill">PREPARE FIRST · COMPARE SECOND</span><h2>A marketplace that starts with readiness.</h2><p>Compare participating financing categories only when your profile is better prepared. New850 keeps marketplace eligibility separate from lender underwriting and partner economics.</p><Link className="referencePrimary" href="/marketplace">Explore the marketplace →</Link></div>
        </section>

        <section className="referenceLower">
          <div className="referencePanel">
            <div className="referencePanelInner"><h3>Your Readiness Journey</h3><div className="referenceTimeline"><div className="referenceTimelineStep done"><i>✓</i>{' '}<b>Goal</b>{' '}<small>Defined</small></div><div className="referenceTimelineStep done"><i>✓</i>{' '}<b>Profile</b>{' '}<small>Measured</small></div><div className="referenceTimelineStep done"><i>✓</i>{' '}<b>Blockers</b>{' '}<small>Prioritized</small></div><div className="referenceTimelineStep current"><i>4</i>{' '}<b>Action Plan</b>{' '}<small>In progress</small></div><div className="referenceTimelineStep"><i>5</i>{' '}<b>Reassess</b>{' '}<small>Measure delta</small></div><div className="referenceTimelineStep"><i>6</i>{' '}<b>Ready to Shop</b>{' '}<small>Planning gate</small></div></div></div>
            <div className="referenceAspirational"><div className="referencePanelInner"><span className="referencePill">MEASURE → IMPROVE → REASSESS</span><h2>Turn Financial Improvement Into Application Readiness.</h2><ul><li>Identify the highest-impact blockers first</li><li>Build measurable 7/30/60/90-day actions</li><li>Track progress against your financing goal</li><li>Shop for credit only when your profile is better prepared</li></ul><Link className="referencePrimary" href={funnelHref(params, 'approval-blueprint')}>Build Your Approval Blueprint →</Link></div></div>
          </div>
          <div className="referencePanel referenceAspirational"><div className="referencePanelInner"><span className="referencePill">PREMIUM PREPARATION</span><h2>Need More Than A Blueprint?</h2><p>Move into guided credit and debt optimization, a mortgage-ready program or high-touch financing-readiness concierge when the goal is larger or the profile is more complex.</p><Link className="referencePrimary" href={funnelHref(params, 'financing-concierge')}>Explore Concierge →</Link></div></div>
          <div className="referenceSideStack"><div className="referencePanel referenceQuote"><h3>Built for Better Decisions</h3><div className="stars">★★★★★</div><p>Understand what is limiting your profile, what to address next, and whether you are better prepared than at your last assessment.</p><small>Readiness scores are planning tools. No score increase, deletion, financing approval, rate or lender outcome is guaranteed.</small></div><div className="referencePanel referenceEducation"><h3>Financial Education</h3><div className="referenceArticle"><div className="referenceArticleVisual" /><div><b>How Utilization Affects Approval Readiness</b>{' '}<span>Understand one of the highest-impact revolving-credit metrics.</span></div></div><div className="referenceArticle"><div className="referenceArticleVisual" /><div><b>Preparing Before You Apply</b>{' '}<span>Organize credit, debt, reserves and documents before financial shopping.</span></div></div></div></div>
        </section>

        <section className="referencePromise"><div><b>Explainable Readiness</b>{' '}<small>Know which factors drive your score</small></div><div><b>Compliance-First</b>{' '}<small>Actions and billing remain policy-gated</small></div><div><b>Evidence-Based</b>{' '}<small>Documented analysis and measurable progress</small></div><div><b>Ready-to-Shop Gate</b>{' '}<small>A planning threshold, never an approval promise</small></div></section>
        <footer className="referenceFooter">
          <div className="businessFooterTop"><Link className="referenceBrand" href="/"><span className="referenceCrest">850</span><span className="referenceBrandText"><strong>NEW850.COM</strong><small>FINANCIAL READINESS</small></span></Link><p>Measure what stands between today’s profile and tomorrow’s financial goal—then act on a documented plan.</p><Link className="referencePrimary" href={funnelHref(params, 'approval-blueprint')}>Check your readiness →</Link></div>
          <div className="businessFooterLinks"><div><b>Prepare</b><Link href="/loan-readiness">How readiness works</Link><Link href="/get-started">Start an assessment</Link><Link href="/services">Services and pricing</Link></div><div><b>Financial goals</b><Link href="/loans">Loans and credit</Link><Link href="/auto">Auto financing</Link><Link href="/mortgage">Home readiness</Link><Link href="/business-funding">Business funding</Link></div><div><b>Existing clients</b><Link href="/portal/sign-in">Client portal</Link><Link href="/portal/forgot-password">Recover access</Link><Link href="/marketplace">Financial marketplace</Link></div></div>
          <div className="businessFooterLegal"><span>© {new Date().getFullYear()} New850.com. All rights reserved.</span><p>New850.com provides financial education, readiness modeling and governed financial-readiness workflows. Readiness scores are planning tools—not credit scores, lender underwriting, or guarantees of score increases, financing approval, rates, terms, funding, or deletion of accurate information. Services remain subject to contracts and applicable federal and state requirements.</p></div>
        </footer>
      </div>
    </main>
  );
}
