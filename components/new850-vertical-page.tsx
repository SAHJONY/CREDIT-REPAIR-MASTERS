import Link from 'next/link';
import { FinancialVisual } from '@/components/financial-visual';
import type { New850Vertical } from '@/lib/new850-platform';

export function New850VerticalPage({ vertical }: { vertical: New850Vertical }) {
  return (
    <main className="commercialCinema">
      <section className="commercialHero">
        <div className="commercialHeroImage" aria-hidden="true" />
        <div className="commercialHeroShade" />
        <div className="commercialHeroCopy">
          <div className="cinematicEyebrow">{vertical.eyebrow} · FINANCIAL READINESS</div>
          <h1>{vertical.title}</h1>
          <p>{vertical.subtitle}</p>
          <div className="publicCinemaActions">
            <Link className="goldButton" href={`/get-started?service=${vertical.serviceId}`}>{vertical.cta} <span>→</span></Link>
            <Link className="glassButton" href="/marketplace">Explore marketplace</Link>
          </div>
        </div>
        <div className="commercialHeroVisual"><FinancialVisual variant={vertical.id} compact label={`${vertical.eyebrow.replace('NEW850 ', '')} financial readiness`} /></div>
        <div className="commercialHeroStats">
          <div><small>MODEL</small><strong>Goal-first</strong><span>prepare before applying</span></div>
          <div><small>MEASURE</small><strong>0–100</strong><span>explainable readiness</span></div>
          <div><small>OUTCOME</small><strong>Ready to Shop</strong><span>planning gate, not approval</span></div>
        </div>
      </section>

      <section className="commercialGroups">
        <div className="commercialGroup blue">
          <div className="commercialSplitIntro">
            <div className="commercialGroupIntro">
              <div className="cinematicEyebrow">HOW NEW850 WORKS</div>
              <h2>{vertical.description}</h2>
              <p>One reusable readiness profile can support multiple financial goals without turning every visit into another application.</p>
            </div>
            <FinancialVisual variant="readiness" label="Readiness intelligence" />
          </div>
          <div className="commercialServiceGrid">
            {vertical.readinessFactors.map((factor, index) => (
              <article className="commercialServiceCard" key={factor}>
                <div className="commercialServiceTop"><span>FACTOR {String(index + 1).padStart(2, '0')}</span><strong>Measured</strong></div>
                <h3>{factor}</h3>
                <p>Tracked as part of the goal-specific readiness profile and prioritized when it materially affects the customer&apos;s next step.</p>
              </article>
            ))}
          </div>
        </div>

        <div className="commercialGroup emerald">
          <div className="commercialSplitIntro reverse">
            <FinancialVisual variant={vertical.id === 'marketplace' ? 'passport' : vertical.id} label={`${vertical.eyebrow.replace('NEW850 ', '')} journey`} />
            <div className="commercialGroupIntro"><div className="cinematicEyebrow">CUSTOMER JOURNEY</div><h2>Readiness before financial shopping.</h2><p>New850 separates preparation from provider underwriting so customers can make stronger, more deliberate decisions.</p></div>
          </div>
          <div className="commercialServiceGrid">
            {vertical.journey.map((step, index) => (
              <article className="commercialServiceCard" key={step}>
                <div className="commercialServiceTop"><span>STEP</span><strong>{String(index + 1).padStart(2, '0')}</strong></div>
                <h3>{step}</h3>
              </article>
            ))}
          </div>
        </div>

        <div className="commercialGroup violet">
          <div className="commercialSplitIntro">
            <div className="commercialGroupIntro"><div className="cinematicEyebrow">MARKETPLACE SCOPE</div><h2>Products New850 can organize around this goal.</h2><p>Availability depends on participating partners, eligibility, geography, licensing and product-specific requirements.</p></div>
            <FinancialVisual variant="marketplace" label="Financial marketplace comparison" />
          </div>
          <div className="commercialServiceGrid">
            {vertical.products.map((product) => (
              <article className="commercialServiceCard" key={product}><div className="commercialServiceTop"><span>PRODUCT</span><strong>Partner-led</strong></div><h3>{product}</h3></article>
            ))}
          </div>
        </div>
      </section>

      <section className="commercialSafety">
        <div><div className="cinematicEyebrow goldText">READINESS ≠ APPROVAL</div><h2>New850 prepares and organizes. Regulated partners make regulated decisions.</h2><p>{vertical.guardrail}</p></div>
        <Link className="goldButton" href={`/get-started?service=${vertical.serviceId}`}>Start readiness assessment →</Link>
      </section>
    </main>
  );
}
