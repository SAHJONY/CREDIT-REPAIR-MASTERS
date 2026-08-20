import Link from 'next/link';
import { consentIsActive, requireCustomerPortalSession } from '@/lib/customer-portal';
import { listLoanReadinessAssessments } from '@/lib/loan-readiness-store';
import { listEligibleMarketplacePartners } from '@/lib/marketplace-store';
import { getPlatformStore } from '@/lib/platform-store';
import type { LoanReadinessAssessment, LoanReadinessGoal } from '@/lib/platform-types';
import type { New850VerticalId } from '@/lib/new850-platform';

export const dynamic = 'force-dynamic';

const goalToVertical: Record<LoanReadinessGoal, New850VerticalId> = {
  mortgage: 'mortgage',
  auto: 'auto',
  credit_card: 'loans',
  personal_loan: 'loans',
  business_credit: 'business',
  lease: 'marketplace',
  financed_purchase: 'marketplace'
};

const verticalLabel: Record<New850VerticalId, string> = {
  loans: 'Loans & Credit',
  auto: 'Auto',
  mortgage: 'Home / Mortgage',
  business: 'Business Funding',
  marketplace: 'Other Financing'
};

function latestByVertical(history: LoanReadinessAssessment[]) {
  const result = new Map<New850VerticalId, LoanReadinessAssessment>();
  for (const assessment of history) {
    const vertical = goalToVertical[assessment.goal];
    if (!result.has(vertical)) result.set(vertical, assessment);
  }
  return result;
}

export default async function PortalMarketplacePage() {
  const portal = await requireCustomerPortalSession();
  const store = getPlatformStore();
  const [consents, history] = await Promise.all([
    store.listConsents(portal.organizationId, portal.client.id),
    listLoanReadinessAssessments(portal.organizationId, portal.client.id, 100)
  ]);

  const sharingConsent = consents
    .filter((consent) => consent.scope === 'marketplace_partner_sharing')
    .sort((a, b) => Date.parse(b.grantedAt) - Date.parse(a.grantedAt))[0];
  const sharingAuthorized = Boolean(sharingConsent && consentIsActive(sharingConsent));
  const latest = latestByVertical(history);

  const matches = await Promise.all(
    Array.from(latest.entries()).map(async ([vertical, assessment]) => ({
      vertical,
      assessment,
      partners: sharingAuthorized
        ? await listEligibleMarketplacePartners(portal.organizationId, vertical, assessment.readinessScore, portal.client.state)
        : []
    }))
  );

  return (
    <main className="portalShell">
      <header className="portalHeader">
        <div>
          <div className="portalBrand">NEW850.COM</div>
          <div className="eyebrow portalPageEyebrow">READY TO SHOP / MARKETPLACE</div>
          <h1>Your financial marketplace</h1>
          <p className="subtitle">Compare participating options only after New850 has enough readiness evidence to make the comparison useful.</p>
        </div>
      </header>

      <section className="grid">
        <section className="portalFeatureCard span12">
          <div className="portalSectionHeading">
            <div>
              <div className="eyebrow">PRIVACY GATE</div>
              <h2>{sharingAuthorized ? 'Partner sharing is authorized' : 'Your data stays inside New850'}</h2>
              <p>{sharingAuthorized
                ? 'You have an active marketplace-sharing authorization. Eligible partner names may be shown below, but no application or lender decision is created by this page.'
                : 'New850 will not reveal or route your profile to a participating provider until you explicitly authorize marketplace partner sharing.'}</p>
            </div>
            <div className={`portalState ${sharingAuthorized ? 'good' : 'waiting'}`}>{sharingAuthorized ? 'Authorized' : 'Private'}</div>
          </div>
          <Link className="secondaryButton" href="/portal/consents">Manage sharing authorization</Link>
        </section>

        {matches.length ? matches.map(({ vertical, assessment, partners }) => (
          <section className="portalFeatureCard span6" key={vertical}>
            <div className="eyebrow">{verticalLabel[vertical].toUpperCase()}</div>
            <h2>{assessment.readinessScore}/100 readiness</h2>
            <p>{assessment.status} · latest assessment {new Date(assessment.createdAt).toLocaleDateString()}</p>
            {!sharingAuthorized ? (
              <div className="portalNotice">Authorize partner sharing before eligible providers can be displayed.</div>
            ) : partners.length ? (
              <div>
                {partners.map((partner) => (
                  <div className="portalRecord" key={partner.id}>
                    <div><strong>{partner.name}</strong><span>Minimum readiness {partner.minReadiness} · {partner.states.length ? partner.states.join(', ') : 'coverage not state-restricted'}</span></div>
                    <b>Eligible to compare</b>
                  </div>
                ))}
                <div className="portalNotice">Eligibility to compare is not approval, preapproval, a rate quote or a commitment to lend. Provider underwriting and disclosures control any later application.</div>
              </div>
            ) : (
              <div className="portalNotice">No participating provider currently matches this readiness profile and state. New850 will not manufacture or substitute providers.</div>
            )}
          </section>
        )) : (
          <section className="portalFeatureCard span12">
            <div className="eyebrow">START WITH READINESS</div>
            <h2>No saved financing-goal assessment yet.</h2>
            <p>Your marketplace becomes useful after a goal-specific readiness assessment establishes your current profile and blockers.</p>
            <Link className="primaryButton" href="/portal/progress">View your readiness plan</Link>
          </section>
        )}

        <section className="portalFeatureCard span12">
          <div className="eyebrow">NEW850 MARKETPLACE STANDARD</div>
          <h2>Customer fit before partner economics.</h2>
          <p>Provider eligibility is based on documented product fit such as financing vertical, readiness threshold and geographic coverage. Compensation is not used to override customer-fit criteria. New850 readiness and marketplace tools are not lender underwriting.</p>
        </section>
      </section>
    </main>
  );
}
