import Link from 'next/link';
import { CinematicPhoto } from '@/components/cinematic-photo';
import './marketplace.css';

const categories = [
  { title: 'Personal loans', text: 'Compare borrowing categories after affordability, utilization and DTI are understood.', href: '/loans' },
  { title: 'Credit cards', text: 'Prepare around utilization, recent inquiries and payment history before shopping.', href: '/loans' },
  { title: 'Auto financing', text: 'Connect vehicle budget, down payment and financing readiness before the dealership.', href: '/auto' },
  { title: 'Mortgages', text: 'Organize credit, DTI, reserves and documentation before licensed mortgage shopping.', href: '/mortgage' },
  { title: 'Business funding', text: 'Match capital needs to revenue, cash flow, business profile and documentation readiness.', href: '/business-funding' },
  { title: 'Financial services', text: 'Expand into banking and adjacent services only where eligibility and partner governance are clear.', href: '/get-started?service=approval-blueprint' }
] as const;

const principles = [
  ['Readiness first', 'New850 starts with your goal and measurable readiness instead of sending you directly into another application.'],
  ['Explainable matching', 'Shopping categories are organized around the factors that materially affect your next financial step.'],
  ['Consent before sharing', 'Your information should move to a participating provider only after an explicit, purpose-specific sharing decision.'],
  ['Independent governance', 'Partner compensation must never silently override fit, eligibility, licensing or required disclosures.']
] as const;

const readinessStates = [
  ['BUILDING', 'Strengthen the profile', 'Important blockers remain. Focus on the factors you can improve before adding more applications.'],
  ['NEAR READY', 'Close the final gaps', 'The profile is moving in the right direction, but a few material issues may still affect shopping readiness.'],
  ['READY TO SHOP', 'Compare deliberately', 'The planning threshold is met for comparison. Providers still make their own underwriting and eligibility decisions.']
] as const;

const journey = [
  ['01', 'Choose your goal', 'Tell New850 what you are trying to finance or purchase.'],
  ['02', 'Build your Financial Passport', 'Measure credit, debt, affordability, reserves and documentation in one reusable profile.'],
  ['03', 'Reduce the blockers you control', 'Follow a prioritized plan instead of applying repeatedly while the same issues remain.'],
  ['04', 'Reach Ready to Shop', 'Use the planning gate to decide when comparison is more appropriate.'],
  ['05', 'Compare participating providers', 'Review relevant categories and partners without treating marketplace visibility as approval.']
] as const;

export default function MarketplacePage() {
  return (
    <main className="marketplacePremium">
      <section className="mpHero">
        <div className="mpHeroGlow" aria-hidden="true" />
        <div className="mpHeroCopy">
          <div className="cinematicEyebrow">NEW850 MARKETPLACE · FINANCIAL READINESS</div>
          <h1>Know when you&apos;re ready. Then compare what fits.</h1>
          <p>One readiness-first marketplace for loans, credit cards, auto financing, mortgages and business funding—built to help you prepare before you apply.</p>
          <div className="publicCinemaActions">
            <Link className="goldButton" href="/get-started?service=approval-blueprint">Check my readiness first <span>→</span></Link>
            <Link className="glassButton" href="/marketplace#categories">Explore financial categories</Link>
          </div>
          <div className="mpTrustStrip" aria-label="Marketplace principles">
            <span>Goal-first</span><span>0–100 readiness</span><span>Consent-controlled</span><span>Partner-led decisions</span>
          </div>
        </div>
      </section>

      <section className="mpPassportBand">
        <div>
          <div className="cinematicEyebrow">YOUR FINANCIAL PASSPORT</div>
          <h2>One profile. Multiple financial goals.</h2>
          <p>New850 turns readiness into a reusable decision layer so customers can prepare once, reassess as conditions change and shop only when the next step makes sense.</p>
        </div>
        <div className="mpScoreCard">
          <small>READINESS</small><strong>82</strong><span>Illustrative planning score</span>
          <div className="mpScoreBar"><i /></div>
          <div className="mpScoreMeta"><span>Credit profile</span><b>Measured</b><span>Affordability</span><b>Measured</b><span>Documentation</span><b>Measured</b></div>
        </div>
      </section>

      <section className="mpStateSection" aria-labelledby="readiness-states-heading">
        <div className="mpSectionHead">
          <div><div className="cinematicEyebrow">READINESS STATES</div><h2 id="readiness-states-heading">Know what the score means before you shop.</h2></div>
          <p>The score is a planning signal, not a lender decision. New850 uses readiness states to separate preparation from comparison.</p>
        </div>
        <div className="mpStateGrid">
          {readinessStates.map(([state, title, text], index) => (
            <article key={state} className={index === 2 ? 'isReady' : ''}>
              <span>{state}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mpSection" id="categories">
        <div className="mpSectionHead">
          <div><div className="cinematicEyebrow">MARKETPLACE CATEGORIES</div><h2>Start with the financial goal—not the provider.</h2></div>
          <p>Availability depends on participating partners, geography, licensing, eligibility and product-specific requirements.</p>
        </div>
        <div className="mpCategoryGrid">
          {categories.map((category, index) => (
            <Link href={category.href} className="mpCategoryCard" key={category.title}>
              <div className="mpCardTop"><span>{String(index + 1).padStart(2, '0')}</span><b>PARTNER-LED</b></div>
              <h3>{category.title}</h3><p>{category.text}</p><strong>Explore readiness →</strong>
            </Link>
          ))}
        </div>
      </section>

      <section className="mpJourney">
        <div className="mpSectionHead light"><div><div className="cinematicEyebrow">THE NEW850 PATH</div><h2>Preparation before financial shopping.</h2></div><p>Readiness is not approval. It is a disciplined way to decide what to improve and when comparison may be more productive.</p></div>
        <div className="mpJourneyGrid">
          {journey.map(([number, title, text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}
        </div>
      </section>

      <section className="mpSection">
        <div className="mpSplit">
          <CinematicPhoto variant="black-couple" label="One profile connecting your financial goals" />
          <div>
            <div className="cinematicEyebrow">WHY NEW850 BEFORE APPLYING</div>
            <h2>Fewer blind applications. Better-prepared decisions.</h2>
            <p>Traditional marketplaces often begin with a product form. New850 begins with the customer&apos;s financial position, goal and blockers.</p>
            <div className="mpPrinciples">
              {principles.map(([title, text]) => <article key={title}><h3>{title}</h3><p>{text}</p></article>)}
            </div>
          </div>
        </div>
      </section>

      <section className="mpSafety">
        <div><div className="cinematicEyebrow goldText">READINESS ≠ APPROVAL</div><h2>New850 prepares, organizes and helps you compare. Regulated partners make regulated decisions.</h2><p>Marketplace visibility, readiness scores and partner matches do not guarantee approval, rates, terms or funding. Participating providers apply their own eligibility, underwriting and regulatory requirements.</p></div>
        <div className="publicCinemaActions"><Link className="goldButton" href="/get-started?service=approval-blueprint">Build my readiness plan →</Link><Link className="glassButton" href="/loan-readiness">See how readiness works</Link></div>
      </section>
    </main>
  );
}
