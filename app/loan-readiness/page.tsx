import Link from 'next/link';

const factors = [
  ['Credit profile', 'Payment history, utilization, derogatories and account mix that may affect financing readiness.'],
  ['Affordability', 'Income, required monthly debt payments and goal-specific debt-to-income pressure.'],
  ['Applications', 'Recent inquiries and application timing that can affect how prepared a profile appears.'],
  ['Liquidity', 'Down payment, reserves and cash requirements relevant to the customer’s stated goal.'],
  ['Documentation', 'Income, identity, banking and other records commonly needed before financial shopping.']
] as const;

const steps = [
  ['01', 'Choose your goal', 'Tell New850 whether you are preparing for a home, vehicle, loan, card, business funding or another financed purchase.'],
  ['02', 'Measure readiness', 'Build a goal-specific view of the controllable factors that may be holding you back.'],
  ['03', 'Prioritize blockers', 'Separate urgent blockers from lower-impact improvements and organize them into a practical action plan.'],
  ['04', 'Reassess before shopping', 'Measure the change in your profile and compare participating financial categories only when you are better prepared.']
] as const;

export default function LoanReadinessPage() {
  return (
    <main className="onboardingCinema onboardingCinema--readiness">
      <section className="onboardingHero">
        <div className="onboardingHeroImage" aria-hidden="true" />
        <div className="onboardingHeroShade" />
        <div className="onboardingHeroCopy">
          <div className="cinematicEyebrow">NEW850.COM · READINESS BEFORE APPLICATION</div>
          <h1>Know what is holding you back.<br/><em>Improve before you apply.</em></h1>
          <p>New850 turns your financing goal into a measurable readiness plan. See the factors that matter, what to address first and when it may make sense to reassess before comparing financial options.</p>
          <div className="publicCinemaActions">
            <Link className="primaryButton" href="/get-started?service=approval-blueprint">Check my readiness</Link>
            <Link className="glassButton" href="/marketplace">Explore marketplace</Link>
          </div>
        </div>
      </section>

      <section className="ownerActionStrip">
        <div className="ownerActionCard">
          <div className="label">NEW850 READINESS SCORE</div>
          <h2>One planning score. Multiple financial goals.</h2>
          <p>A New850 Readiness Score is a 0–100 educational planning measure built from the information available for your selected goal. It is not a credit score, lender underwriting score, prequalification, preapproval or financing decision.</p>
        </div>
        <div className="ownerActionCard">
          <div className="label">READY TO SHOP</div>
          <h2>Preparation first. Comparison second.</h2>
          <p>Ready to Shop is a New850 planning gate used to indicate that identified blockers have improved or been addressed. Participating providers make their own eligibility, pricing and underwriting decisions.</p>
        </div>
      </section>

      <section className="grid">
        <div className="card span12">
          <div className="label">WHAT WE MEASURE</div>
          <h2>Your financial readiness is more than one credit number.</h2>
          <div className="grid">
            {factors.map(([title, detail]) => (
              <div className="card span4" key={title}>
                <h3>{title}</h3>
                <p className="small">{detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card span12">
          <div className="label">HOW NEW850 WORKS</div>
          <h2>Goal → readiness → blockers → action plan → reassessment → marketplace.</h2>
          <div className="journeyGrid">
            {steps.map(([number, title, detail]) => (
              <div key={number}><b>{number}</b><strong>{title}</strong><span>{detail}</span></div>
            ))}
          </div>
        </div>

        <div className="card span12">
          <div className="row">
            <div>
              <div className="label">START WITH YOUR GOAL</div>
              <h2>Get a documented readiness blueprint before financial shopping.</h2>
              <p className="small">New850 does not guarantee score increases, approvals, rates, terms, funding or removal of accurate information.</p>
            </div>
            <div className="headerActions">
              <Link className="primaryButton" href="/get-started?service=approval-blueprint">Check my readiness</Link>
              <Link className="secondaryButton" href="/portal/sign-in">Existing client</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
