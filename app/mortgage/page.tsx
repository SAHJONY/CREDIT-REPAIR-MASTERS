import Link from 'next/link';
import { CinematicPhoto } from '@/components/cinematic-photo';
import './home.css';

const factors = [
  ['Credit profile', 'Understand the credit factors most likely to affect mortgage shopping readiness.'],
  ['Debt-to-income', 'Track front-end and back-end DTI against the payment and home-price target.'],
  ['Down payment', 'Measure available funds against the planned purchase range and closing needs.'],
  ['Cash reserves', 'Build a post-closing reserve buffer instead of using every available dollar.'],
  ['Income documentation', 'Organize income, employment and supporting documents before partner handoff.'],
  ['Recent credit activity', 'Surface recent inquiries, new accounts and other changes before mortgage shopping.']
] as const;

const journey = [
  ['01', 'Set the home target', 'Define a realistic purchase range, payment target and timing.'],
  ['02', 'Measure mortgage readiness', 'Connect credit, DTI, cash, reserves and documentation in one profile.'],
  ['03', 'Strengthen the file', 'Address controllable blockers before submitting unnecessary applications.'],
  ['04', 'Reach Ready to Shop', 'Use the planning gate to determine when comparison is more appropriate.'],
  ['05', 'Compare licensed options', 'Review participating mortgage providers while each lender keeps its own underwriting authority.']
] as const;

const paths = [
  ['Mortgage readiness', 'Build the preparation profile before lender shopping.'],
  ['Licensed mortgage partners', 'Compare participating licensed providers when readiness supports the next step.'],
  ['Document vault', 'Keep supporting documents organized for controlled, purpose-specific sharing.'],
  ['Affordability planning', 'Translate income, debt, down payment and reserves into a clearer target range.'],
  ['Real-estate partners', 'Add transaction partners only where customer choice and disclosures remain clear.'],
  ['Home services', 'Expand adjacent services later without mixing them into mortgage underwriting.']
] as const;

export default function MortgagePage() {
  return (
    <main className="homePremium">
      <section className="hmHero">
        <div className="hmHeroGlow" aria-hidden="true" />
        <div className="hmHeroCopy">
          <div className="cinematicEyebrow">NEW850 HOME · MORTGAGE READINESS</div>
          <h1>Build the file before you shop for the house.</h1>
          <p>Turn credit, DTI, down payment, reserves and documentation into one measurable mortgage-readiness plan before you compare licensed options.</p>
          <div className="publicCinemaActions">
            <Link className="goldButton" href="/get-started?service=mortgage-ready-90">Build my mortgage readiness plan <span>→</span></Link>
            <Link className="glassButton" href="#readiness">See what we measure</Link>
          </div>
          <div className="hmTrustStrip"><span>Goal-first</span><span>Affordability-aware</span><span>Document-ready</span><span>Licensed partner decisions</span></div>
        </div>
      </section>

      <section className="hmPlanBand">
        <div><div className="cinematicEyebrow">YOUR HOME READINESS PLAN</div><h2>A stronger mortgage file is more than a credit score.</h2><p>New850 combines the financial and documentation factors that shape mortgage shopping readiness so you can see what is strong, what needs work and what should happen next.</p></div>
        <div className="hmPlanCard">
          <small>ILLUSTRATIVE READINESS</small><strong>82</strong><span>Planning score — not mortgage approval</span>
          <div className="hmPlanBar"><i /></div>
          <div className="hmPlanMeta"><span>Credit</span><b>Measured</b><span>DTI</span><b>Measured</b><span>Reserves</span><b>Measured</b><span>Documents</span><b>Measured</b></div>
        </div>
      </section>

      <section className="hmSection" id="readiness">
        <div className="hmSectionHead"><div><div className="cinematicEyebrow">MORTGAGE READINESS</div><h2>Six factors that shape the strength of the file.</h2></div><p>The assessment is designed for preparation and planning. It does not replace lender underwriting, preapproval or a commitment to lend.</p></div>
        <div className="hmFactorGrid">{factors.map(([title,text],index)=><article key={title}><div className="hmCardTop"><span>FACTOR {String(index+1).padStart(2,'0')}</span><b>MEASURED</b></div><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>

      <section className="hmJourney">
        <div className="hmSectionHead light"><div><div className="cinematicEyebrow">THE NEW850 HOME PATH</div><h2>From home goal to better-prepared mortgage shopping.</h2></div><p>Preparation happens first. Licensed mortgage professionals make regulated lending and origination decisions.</p></div>
        <div className="hmJourneyGrid">{journey.map(([n,t,d])=><article key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></article>)}</div>
      </section>

      <section className="hmSection">
        <div className="hmSplit">
          <CinematicPhoto variant="multiracial" label="Prepare your profile for the home you want" />
          <div><div className="cinematicEyebrow">READY FILE, CLEARER NEXT STEP</div><h2>Organize the numbers and the documents together.</h2><p>A mortgage-ready profile should connect affordability, reserves and credit with the evidence a future provider may ask to review.</p><div className="hmPrinciples"><article><h3>Affordability before price</h3><p>Start with sustainable payment capacity instead of a headline home price.</p></article><article><h3>Reserves after closing</h3><p>Plan for liquidity beyond the down payment and expected closing costs.</p></article><article><h3>Documentation completeness</h3><p>Identify missing income and financial records before provider handoff.</p></article><article><h3>Controlled sharing</h3><p>Customer information moves only with explicit, purpose-specific consent.</p></article></div></div>
        </div>
      </section>

      <section className="hmSection hmPaths">
        <div className="hmSectionHead"><div><div className="cinematicEyebrow">HOME MARKETPLACE</div><h2>Organize the services around the home goal.</h2></div><p>Availability depends on participating partners, licensing, geography, eligibility and product-specific requirements.</p></div>
        <div className="hmPathGrid">{paths.map(([title,text])=><article key={title}><span>PARTNER-LED</span><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>

      <section className="hmSafety">
        <div><div className="cinematicEyebrow goldText">READINESS ≠ PREAPPROVAL</div><h2>New850 prepares the customer. Licensed mortgage providers make lending decisions.</h2><p>New850 does not originate, broker or approve mortgages through this readiness experience. Rates, terms, eligibility, underwriting and lending decisions belong to appropriately licensed participating providers.</p></div>
        <div className="publicCinemaActions"><Link className="goldButton" href="/get-started?service=mortgage-ready-90">Start my home readiness plan →</Link><Link className="glassButton" href="/marketplace">Explore marketplace</Link></div>
      </section>
    </main>
  );
}
