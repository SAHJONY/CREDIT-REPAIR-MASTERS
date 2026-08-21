import Link from 'next/link';
import { FinancialVisual } from '@/components/financial-visual';
import './loans.css';

const factors = [
  ['Credit profile', 'Understand the score range, derogatory pressure and file quality that may affect borrowing options.'],
  ['Debt-to-income ratio', 'Measure required monthly debt against gross income before adding a new payment.'],
  ['Revolving utilization', 'See how reported card balances may be affecting readiness and where reduction can matter.'],
  ['Payment history', 'Identify late-payment patterns and recent delinquencies that can weaken an application profile.'],
  ['Recent inquiries', 'Track recent credit-seeking activity so repeated applications do not become the strategy.'],
  ['Income stability', 'Organize income consistency and documentation before comparing borrowing categories.']
] as const;

const journey = [
  ['01', 'Define the borrowing goal', 'Start with what the money is for, how much is actually needed and the payment range you can support.'],
  ['02', 'Measure affordability and blockers', 'Review credit, DTI, utilization, payment history, inquiries and income stability together.'],
  ['03', 'Improve the controllable factors', 'Prioritize the changes most likely to strengthen readiness before another application.'],
  ['04', 'Reach Ready to Shop', 'Use New850 as a planning gate—not as a guarantee that a lender will approve.'],
  ['05', 'Compare relevant categories', 'Review participating provider categories only when the profile is better prepared for comparison.']
] as const;

const products = [
  ['Personal loans', 'Unsecured borrowing for eligible consumers where purpose, affordability and lender criteria align.'],
  ['Debt consolidation', 'Evaluate whether combining obligations may improve payment structure without assuming savings or approval.'],
  ['Credit cards', 'Prepare around utilization, inquiries, limits and repayment behavior before shopping card categories.'],
  ['Lines of credit', 'Compare revolving borrowing categories where eligibility, pricing and repayment terms fit the goal.'],
  ['Refinancing', 'Revisit existing debt only when the potential structure is meaningfully better for the customer.'],
  ['Secured financing', 'Explore collateral-backed categories where appropriate and after understanding the added asset risk.']
] as const;

export default function LoansPage() {
  return (
    <main className="loansPremium">
      <section className="lnHero">
        <div className="lnHeroGlow" aria-hidden="true" />
        <div className="lnHeroCopy">
          <div className="cinematicEyebrow">NEW850 LOANS · FINANCIAL READINESS</div>
          <h1>Know your borrowing position before you apply.</h1>
          <p>Build a clearer borrowing plan around affordability, debt load, utilization, payment history and income stability—then compare financing categories when your profile is better prepared.</p>
          <div className="publicCinemaActions">
            <Link className="goldButton" href="/get-started?service=approval-blueprint">Build my loan readiness plan <span>→</span></Link>
            <Link className="glassButton" href="/marketplace">Explore marketplace</Link>
          </div>
          <div className="lnTrustStrip"><span>Goal-first</span><span>0–100 readiness</span><span>Affordability-aware</span><span>Partner-led decisions</span></div>
        </div>
        <div className="lnHeroVisual"><FinancialVisual variant="loans" label="New850 loans readiness" /></div>
      </section>

      <section className="lnPlanBand">
        <div><div className="cinematicEyebrow">BORROWING READINESS</div><h2>One profile for the borrowing decisions that come next.</h2><p>New850 combines the factors a customer can monitor and improve into one reusable readiness view. It helps answer whether the profile is ready for comparison—not whether a lender will approve.</p></div>
        <div className="lnPlanCard"><small>READINESS</small><strong>82</strong><span>Illustrative planning score — not a credit decision</span><div className="lnPlanBar"><i /></div><div className="lnPlanMeta"><span>Affordability</span><b>Measured</b><span>Debt load</span><b>Measured</b><span>Application pressure</span><b>Measured</b></div></div>
      </section>

      <section className="lnSection">
        <div className="lnSectionHead"><div><div className="cinematicEyebrow">WHAT NEW850 MEASURES</div><h2>Six factors before the next application.</h2></div><p>The readiness model prioritizes what can materially change the customer's borrowing profile and next step.</p></div>
        <div className="lnFactorGrid">{factors.map(([title,text],index)=><article key={title}><div className="lnCardTop"><span>FACTOR {String(index+1).padStart(2,'0')}</span><b>MEASURED</b></div><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>

      <section className="lnJourney">
        <div className="lnSectionHead light"><div><div className="cinematicEyebrow">THE NEW850 LOAN PATH</div><h2>Prepare before financial shopping.</h2></div><p>Repeated applications are not a readiness strategy. New850 creates a measurable path from borrowing goal to more deliberate comparison.</p></div>
        <div className="lnJourneyGrid">{journey.map(([n,t,x])=><article key={n}><span>{n}</span><h3>{t}</h3><p>{x}</p></article>)}</div>
      </section>

      <section className="lnSection">
        <div className="lnSplit"><FinancialVisual variant="readiness" label="New850 borrowing readiness intelligence" /><div><div className="cinematicEyebrow">WHY READINESS FIRST</div><h2>Borrow with a plan, not an application streak.</h2><p>New850 is designed to reduce blind shopping by putting affordability and file readiness before provider comparison.</p><div className="lnPrinciples"><article><h3>Affordability first</h3><p>A payment should fit the financial plan before a product is compared.</p></article><article><h3>Blocker reduction</h3><p>Improve the controllable pressure points before submitting another application.</p></article><article><h3>Purpose-specific consent</h3><p>Customer information should be shared only after an explicit decision for a defined purpose.</p></article><article><h3>No approval promise</h3><p>Readiness scoring never substitutes for lender underwriting, pricing or eligibility.</p></article></div></div></div>
      </section>

      <section className="lnSection lnProducts">
        <div className="lnSectionHead"><div><div className="cinematicEyebrow">LOAN MARKETPLACE SCOPE</div><h2>Financing categories organized around the borrowing goal.</h2></div><p>Availability depends on participating providers, geography, eligibility, licensing and product-specific requirements.</p></div>
        <div className="lnProductGrid">{products.map(([title,text])=><article key={title}><span>PARTNER-LED</span><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>

      <section className="lnSafety"><div><div className="cinematicEyebrow goldText">READINESS ≠ APPROVAL</div><h2>New850 prepares and organizes. Financial institutions make lending decisions.</h2><p>Readiness scores, marketplace categories and planning guidance do not guarantee approval, limits, rates, savings, terms or funding. Participating providers apply their own underwriting and eligibility requirements.</p></div><div className="publicCinemaActions"><Link className="goldButton" href="/get-started?service=approval-blueprint">Start my readiness plan →</Link><Link className="glassButton" href="/marketplace">Explore marketplace</Link></div></section>
    </main>
  );
}
