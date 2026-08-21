import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LoanReadinessWorkbench } from '@/components/loan-readiness-workbench';
import { getBusinessSession } from '@/lib/session-access';

export const dynamic = 'force-dynamic';

export default async function OwnerReadinessPage() {
  const session = await getBusinessSession();
  if (!session) redirect('/auth/sign-in');
  if (session.member.role !== 'owner') redirect('/dashboard');
  if (session.mfaRequired && !session.mfaAssured) redirect('/auth/mfa');

  return (
    <main>
      <header className="ownerHero">
        <div>
          <div className="kicker">NEW850 OWNER OS / FINANCIAL READINESS ENGINE</div>
          <h1>Universal Financial Readiness</h1>
          <p className="subtitle">Prepare customers for mortgages, auto loans, credit cards, personal loans, business funding, leases and financed purchases with measurable, compliant readiness planning.</p>
        </div>
        <div className="ownerNav">
          <Link className="secondaryButton" href="/owner">New850 Owner OS</Link>
          <Link className="secondaryButton" href="/owner/marketplace">Marketplace</Link>
          <Link className="secondaryButton" href="/clients">Clients</Link>
          <Link className="secondaryButton" href="/documents">Documents</Link>
          <Link className="secondaryButton" href="/compliance">Compliance</Link>
        </div>
      </header>

      <section className="ownerActionStrip">
        <div className="ownerActionCard">
          <div className="label">MISSION</div>
          <h2>Move each customer from desire to documented readiness.</h2>
          <p>Measure the current profile, identify the highest-impact blockers, create a prioritized roadmap, reassess progress and guide the customer to compare financial options only when the profile is stronger.</p>
        </div>
        <div className="ownerActionCard">
          <div className="label">SUPPORTED GOALS</div>
          <p>Home · Vehicle · Credit Card · Personal Loan · Business Funding · Apartment / Lease · Any Financed Purchase</p>
        </div>
      </section>

      <LoanReadinessWorkbench />
    </main>
  );
}
