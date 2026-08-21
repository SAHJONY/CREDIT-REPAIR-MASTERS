import Link from 'next/link';
import { FinancialVisual } from '@/components/financial-visual';
import './business.css';

const factors = [
  ['Business age', 'Track operating history and entity maturity because many funding categories use time in business as an eligibility signal.'],
  ['Revenue', 'Organize recent revenue trends and seasonality so capital needs are evaluated against actual business activity.'],
  ['Cash flow', 'Measure inflows, outflows and debt-service pressure before adding another obligation.'],
  ['Banking history', 'Review deposit consistency, overdraft pressure and account stability before provider comparison.'],
  ['Business credit profile', 'Understand business-credit reporting, utilization and derogatory pressure where available.'],
  ['Documentation completeness', 'Prepare entity, ownership, bank, tax and financial records before a provider requests them.']
] as const;

const journey = [
  ['01', 'Define the capital use', 'Start with the exact use of funds, target amount, timing and expected business outcome.'],
  ['02', 'Measure funding readiness', 'Review revenue, cash flow, banking history, business credit and documentation together.'],
  ['03', 'Close the gaps you control', 'Strengthen financial records, cash-flow visibility and entity documentation before applying.'],
  ['04', 'Reach Ready to Shop', 'Use the readiness gate to decide when funding comparison is more appropriate.'],
  ['05', 'Compare relevant categories', 'Review participating capital-provider categories without treating marketplace visibility as approval.']
] as const;

const products = [
  ['Term loans', 'Fixed-duration business borrowing where provider eligibility, pricing and repayment structure fit the capital use.'],
  ['Lines of credit', 'Flexible revolving capital for eligible businesses with recurring working-capital needs.'],
  ['Equipment financing', 'Asset-linked financing categories when the funding purpose is qualified equipment or machinery.'],
  ['Working capital', 'Shorter-horizon capital categories evaluated against revenue, cash flow and repayment capacity.'],
  ['Invoice financing', 'Receivables-based categories where customer invoices and payment cycles support the structure.'],
  ['SBA readiness', 'Organize the business profile and documentation needed before approaching participating SBA-oriented providers.']
] as const;

export default function BusinessFundingPage() {
  return (
    <main className="businessPremium">
      <section className="bzHero">
        <div className="bzHeroGlow" aria-hidden="true" />
        <div className="bzHeroCopy">
          <div className="cinematicEyebrow">NEW850 BUSINESS · FINANCIAL READINESS</div>
          <h1>Turn business performance into funding readiness.</h1>
          <p>Build a clearer capital profile around revenue, cash flow, banking history, business credit and documentation—then compare funding categories when the business is better prepared.</p>
          <div className="publicCinemaActions">
            <Link className="goldButton" href="/get-started?service=business-credit-accelerator">Build my business funding profile <span>→</span></Link>
            <Link className="glassButton" href="/marketplace">Explore marketplace</Link>
          </div>
          <div className="bzTrustStrip"><span>Goal-first</span><span>0–100 readiness</span><span>Cash-flow aware</span><span>Provider-led decisions</span></div>
        </div>
      </section>

      <section className="bzPlanBand">
        <div><div className="cinematicEyebrow">BUSINESS FUNDING PROFILE</div><h2>One operating profile before the next capital application.</h2><p>New850 turns business data into an explainable readiness layer so owners can identify documentation gaps, financial pressure points and the funding categories worth evaluating next.</p></div>
        <div className="bzPlanCard"><small>READINESS</small><strong>82</strong><span>Illustrative planning score — not a funding decision</span><div className="bzPlanBar"><i /></div><div className="bzPlanMeta"><span>Revenue quality</span><b>Measured</b><span>Cash-flow capacity</span><b>Measured</b><span>Documentation</span><b>Measured</b></div></div>
      </section>

      <section className="bzSection">
        <div className="bzSectionHead"><div><div className="cinematicEyebrow">WHAT NEW850 MEASURES</div><h2>Six signals before you approach capital.</h2></div><p>The readiness model focuses on information that can materially affect business funding fit and the next preparation step.</p></div>
        <div className="bzFactorGrid">{factors.map(([title,text],index)=><article key={title}><div className="bzCardTop"><span>FACTOR {String(index+1).padStart(2,'0')}</span><b>MEASURED</b></div><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>

      <section className="bzJourney">
        <div className="bzSectionHead light"><div><div className="cinematicEyebrow">THE NEW850 BUSINESS PATH</div><h2>Prepare the company before you shop for capital.</h2></div><p>Funding readiness is a planning discipline: define the use, organize the business profile, reduce gaps and compare categories deliberately.</p></div>
        <div className="bzJourneyGrid">{journey.map(([n,t,x])=><article key={n}><span>{n}</span><h3>{t}</h3><p>{x}</p></article>)}</div>
      </section>

      <section className="bzSection">
        <div className="bzSplit"><FinancialVisual variant="growth" label="New850 business growth readiness" /><div><div className="cinematicEyebrow">WHY READINESS FIRST</div><h2>Capital should fit the business—not just the application.</h2><p>New850 helps owners understand operating capacity and documentation before entering a provider funnel.</p><div className="bzPrinciples"><article><h3>Use-of-funds clarity</h3><p>Match the financing category to a defined business purpose and time horizon.</p></article><article><h3>Cash-flow discipline</h3><p>Evaluate repayment pressure against actual operating performance before borrowing.</p></article><article><h3>Document readiness</h3><p>Organize entity and financial records before they become an underwriting delay.</p></article><article><h3>No funding promise</h3><p>Readiness never substitutes for provider underwriting, pricing or eligibility.</p></article></div></div></div>
      </section>

      <section className="bzSection bzProducts">
        <div className="bzSectionHead"><div><div className="cinematicEyebrow">BUSINESS MARKETPLACE SCOPE</div><h2>Capital categories organized around the business need.</h2></div><p>Availability depends on participating providers, geography, eligibility, licensing and product-specific requirements.</p></div>
        <div className="bzProductGrid">{products.map(([title,text])=><article key={title}><span>PARTNER-LED</span><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>

      <section className="bzSafety"><div><div className="cinematicEyebrow goldText">READINESS ≠ APPROVAL</div><h2>New850 prepares and organizes. Capital providers make funding decisions.</h2><p>New850 does not guarantee business funding, approval, pricing, rates, limits, terms or SBA eligibility. Participating providers apply their own underwriting, documentation and eligibility requirements.</p></div><div className="publicCinemaActions"><Link className="goldButton" href="/get-started?service=business-credit-accelerator">Build my funding profile →</Link><Link className="glassButton" href="/marketplace">Explore marketplace</Link></div></section>
    </main>
  );
}
