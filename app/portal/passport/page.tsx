import Link from 'next/link';
import { FinancialVisual } from '@/components/financial-visual';
import { PortalNav } from '@/components/portal-nav';
import { consentIsActive, requireCustomerPortalSession } from '@/lib/customer-portal';
import { getPlatformStore } from '@/lib/platform-store';

export const dynamic = 'force-dynamic';

const goals = [
  { label: 'Auto', href: '/auto', detail: 'Vehicle budget, payment range, down payment and auto-loan readiness.' },
  { label: 'Home', href: '/mortgage', detail: 'Mortgage readiness across credit, DTI, reserves, down payment and documents.' },
  { label: 'Loans', href: '/loans', detail: 'Borrowing readiness for personal loans, cards and lines of credit.' },
  { label: 'Business', href: '/business-funding', detail: 'Funding readiness across business profile, revenue, cash flow and documentation.' }
] as const;

export default async function FinancialPassportPage() {
  const portal = await requireCustomerPortalSession();
  const store = getPlatformStore();
  const [consents, evidence] = await Promise.all([
    store.listConsents(portal.organizationId, portal.client.id),
    store.listEvidence(portal.organizationId, portal.client.id)
  ]);

  const analysisConsent = consents.some((consent) => consent.scope === 'credit_report_analysis' && consentIsActive(consent));
  const reports = evidence.filter((item) => item.type === 'credit_report');
  const documents = evidence.filter((item) => item.type !== 'credit_report');
  const profileSignals = [
    { label: 'Identity & portal', value: 'Verified session', ready: true },
    { label: 'Credit analysis consent', value: analysisConsent ? 'Active' : 'Needed', ready: analysisConsent },
    { label: 'Credit reports', value: reports.length ? `${reports.length} on file` : 'Needed', ready: reports.length > 0 },
    { label: 'Supporting documents', value: documents.length ? `${documents.length} on file` : 'Build as goals require', ready: documents.length > 0 }
  ];
  const completedSignals = profileSignals.filter((item) => item.ready).length;
  const passportCompletion = Math.round((completedSignals / profileSignals.length) * 100);

  return (
    <main className="portalShell">
      <header className="portalHeader portalVisualHero">
        <div>
          <div className="portalBrand">NEW850.COM</div>
          <div className="eyebrow portalPageEyebrow">FINANCIAL PASSPORT</div>
          <h1>One profile. Multiple financial goals.</h1>
          <p className="subtitle">Your New850 Financial Passport organizes reusable readiness information so each financing journey can start from what is already known.</p>
          <PortalNav />
        </div>
        <FinancialVisual variant="passport" compact label="Secure Financial Passport" />
      </header>

      <section className="grid">
        <section className="portalFeatureCard span12">
          <div className="portalSectionHeading"><div><div className="eyebrow">PASSPORT COMPLETION</div><h2>{passportCompletion}% foundation complete</h2><p>Completion reflects only information currently available in your secure New850 account. It is not a credit score or lender decision.</p></div><div className="portalCount">{completedSignals}<span>of {profileSignals.length} signals</span></div></div>
          <div className="portalTimelineSteps">{profileSignals.map((signal, index) => <div className={signal.ready ? 'timelineDone' : ''} key={signal.label}><i>{signal.ready ? '✓' : index + 1}</i><strong>{signal.label}</strong><span>{signal.value}</span></div>)}</div>
        </section>

        <section className="portalFeatureCard span12">
          <div className="pageVisualBand">
            <div><div className="eyebrow">MULTI-GOAL READINESS</div><h2>Choose what you want to finance next.</h2><p>Each goal uses the shared passport plus goal-specific factors. Readiness is assessed separately for each financing objective.</p></div>
            <FinancialVisual variant="readiness" compact label="Goal-specific readiness" />
          </div>
          <div className="portalSourceGrid">{goals.map((goal) => <Link className="portalSourceCard" href={goal.href} key={goal.label}><strong>New850 {goal.label}</strong><span>{goal.detail}</span><b>Open goal →</b></Link>)}</div>
        </section>

        <section className="portalFeatureCard span6"><div className="eyebrow">NEXT BEST ACTION</div><h2>{analysisConsent && reports.length ? 'Start a goal-specific readiness assessment.' : 'Complete the passport foundation first.'}</h2><p>{analysisConsent && reports.length ? 'Your core credit-analysis foundation is available. Choose a financing goal to measure the additional factors that matter for that journey.' : 'Activate credit-analysis authorization and place a current credit report on file before relying on a readiness assessment.'}</p><Link className="primaryButton" href={analysisConsent && reports.length ? '/marketplace' : '/portal/reports'}>{analysisConsent && reports.length ? 'Explore financial goals' : 'Complete credit foundation'}</Link></section>
        <section className="portalFeatureCard span6"><FinancialVisual variant="security" compact label="Privacy and data control" /><div className="eyebrow">PRIVACY & CONTROL</div><h2>Your passport is not an application.</h2><p>New850 uses your stored information for readiness planning only within the permissions you grant. A partner application or data handoff requires its own appropriate consent and disclosures.</p><Link className="secondaryButton" href="/portal/consents">Review authorizations</Link></section>
      </section>
    </main>
  );
}
