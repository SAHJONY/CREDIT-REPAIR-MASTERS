import Link from 'next/link';
import { CinematicPhoto } from '@/components/cinematic-photo';
import './auto.css';

const readiness = [
  ['Vehicle budget', 'Set a total vehicle target before the monthly payment hides the true purchase cost.'],
  ['Payment target', 'Model a monthly payment range that fits the rest of your financial obligations.'],
  ['Down payment', 'See how cash down can change the amount financed and the resilience of the deal.'],
  ['Credit profile', 'Measure the credit factors that may influence financing options without treating readiness as approval.'],
  ['DTI impact', 'Understand how the proposed auto payment affects your broader debt-to-income picture.'],
  ['Trade-in equity', 'Account for positive or negative equity before it gets rolled into the next transaction.']
] as const;

const journey = [
  ['01', 'Choose the vehicle budget', 'Start with what the purchase should cost—not what a dealership says the payment can be.'],
  ['02', 'Build auto readiness', 'Measure payment capacity, credit, down payment, DTI and trade-in position.'],
  ['03', 'Improve controllable blockers', 'Reduce avoidable pressure before financing or vehicle shopping.'],
  ['04', 'Reach Ready to Shop', 'Use the planning gate to decide when comparison is more appropriate.'],
  ['05', 'Compare financing and vehicles', 'Evaluate participating lenders, dealers and vehicle options without treating visibility as approval.']
] as const;

const paths = [
  ['Auto loans', 'Purchase financing organized around readiness and affordability.', '/marketplace'],
  ['Refinancing', 'Reassess an existing loan when credit, equity or market conditions change.', '/marketplace'],
  ['Vehicle marketplace', 'Shop vehicles with a defined budget and financing plan.', '/marketplace'],
  ['Dealer partners', 'Connect to participating dealers only after the customer understands the target deal structure.', '/marketplace'],
  ['Trade-in planning', 'Bring equity position into the purchase decision before negotiating.', '/get-started?service=auto-loan-ready'],
  ['Protection products', 'Evaluate optional products later, with transparent pricing and customer choice.', '/marketplace']
] as const;

export default function AutoPage() {
  return (
    <main className="autoPremium">
      <section className="autoHero">
        <div className="autoHeroCopy">
          <div className="cinematicEyebrow">NEW850 AUTO · FINANCIAL READINESS</div>
          <h1>Know the deal before you enter the dealership.</h1>
          <p>Build the vehicle budget, monthly-payment target, down payment and financing profile first—so the shopping decision starts with your numbers.</p>
          <div className="publicCinemaActions">
            <Link className="goldButton" href="/get-started?service=auto-loan-ready">Build my auto readiness plan <span>→</span></Link>
            <Link className="glassButton" href="#auto-paths">Explore auto marketplace</Link>
          </div>
          <div className="autoTrust"><span>Budget-first</span><span>0–100 readiness</span><span>Payment-aware</span><span>No approval promises</span></div>
        </div>
        <div className="autoHeroVisual"><CinematicPhoto variant="mobility" label="A premium vehicle on the road ahead" priority compact /></div>
      </section>

      <section className="autoPlanBand">
        <div>
          <div className="cinematicEyebrow">YOUR AUTO BUYING PLAN</div>
          <h2>Price, payment and financing should work together.</h2>
          <p>New850 Auto turns the purchase into one measurable plan so customers can see the relationship between vehicle price, amount financed, down payment, trade-in equity and monthly affordability.</p>
        </div>
        <div className="autoDealCard">
          <small>ILLUSTRATIVE PLAN</small><strong>$425/mo</strong><span>target payment—not a lender quote</span>
          <div className="autoDealGrid"><span>Vehicle budget</span><b>$24K</b><span>Down payment</span><b>$3K</b><span>Readiness</span><b>82/100</b><span>Status</span><b>Planning</b></div>
        </div>
      </section>

      <section className="autoSection">
        <div className="autoSectionHead"><div><div className="cinematicEyebrow">AUTO READINESS FACTORS</div><h2>Measure the deal before the application.</h2></div><p>Each factor is tracked because it can materially change affordability, timing or the structure of the next auto-financing decision.</p></div>
        <div className="autoFactorGrid">
          {readiness.map(([title, text], index) => <article key={title}><div><span>FACTOR {String(index + 1).padStart(2, '0')}</span><b>MEASURED</b></div><h3>{title}</h3><p>{text}</p></article>)}
        </div>
      </section>

      <section className="autoJourney">
        <div className="autoSectionHead light"><div><div className="cinematicEyebrow">CUSTOMER JOURNEY</div><h2>From “I need a car” to a deliberate purchase plan.</h2></div><p>New850 separates preparation from lender underwriting and dealer sales so customers can make the comparison stage more intentional.</p></div>
        <div className="autoJourneyGrid">{journey.map(([n,t,d]) => <article key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></article>)}</div>
      </section>

      <section className="autoSection" id="auto-paths">
        <div className="autoSplit">
          <CinematicPhoto variant="mobility" label="Prepare before entering the auto marketplace" />
          <div><div className="cinematicEyebrow">AUTO MARKETPLACE</div><h2>Organize the entire purchase around customer fit.</h2><p>Financing, vehicle selection, trade-in and dealer participation should reinforce the readiness plan—not replace it.</p></div>
        </div>
        <div className="autoPathGrid">{paths.map(([title,text,href]) => <Link href={href} key={title}><span>PARTNER-LED</span><h3>{title}</h3><p>{text}</p><strong>Explore →</strong></Link>)}</div>
      </section>

      <section className="autoSafety">
        <div><div className="cinematicEyebrow goldText">READINESS ≠ APPROVAL</div><h2>New850 prepares the buyer. Lenders and dealers make their own financing and sales decisions.</h2><p>Illustrative budgets, payment targets and readiness scores are planning tools, not credit offers, approvals, rates or terms. Participating providers apply their own underwriting, eligibility, pricing and regulatory requirements.</p></div>
        <div className="publicCinemaActions"><Link className="goldButton" href="/get-started?service=auto-loan-ready">Start my auto plan →</Link><Link className="glassButton" href="/marketplace">Open marketplace</Link></div>
      </section>
    </main>
  );
}
