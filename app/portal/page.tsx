import Link from 'next/link';
import { PortalNav } from '@/components/portal-nav';
import { consentIsActive, requireCustomerPortalSession } from '@/lib/customer-portal';
import { getPlatformStore } from '@/lib/platform-store';

export const dynamic = 'force-dynamic';

export default async function PortalHome() {
  const portal = await requireCustomerPortalSession();
  const store = getPlatformStore();
  const [consents, evidence] = await Promise.all([
    store.listConsents(portal.organizationId, portal.client.id),
    store.listEvidence(portal.organizationId, portal.client.id)
  ]);
  const analysisConsent = consents.some((c) => c.scope === 'credit_report_analysis' && consentIsActive(c));
  const reports = evidence.filter((e) => e.type === 'credit_report');
  const ready = analysisConsent && reports.length > 0;
  const completed = Number(analysisConsent) + Number(reports.length > 0) + Number(ready);
  const progress = Math.round((completed / 3) * 100);

  return (
    <main className="portalShell">
      <header className="portalHeader">
        <div>
          <div className="portalBrand">CREDIT REPAIR MASTERS</div>
          <h1>Welcome back, {portal.client.displayName}</h1>
          <p className="subtitle">Here is where your credit improvement plan stands today.</p>
        </div>
        <PortalNav />
      </header>

      <section className="portalHero">
        <div>
          <div className="eyebrow">YOUR PROGRESS</div>
          <div className="portalProgressValue">{progress}%</div>
          <p className="portalLead">{ready ? 'Your file is ready for the next review.' : 'Complete the remaining steps so we can continue your review.'}</p>
        </div>
        <div className="portalProgressPanel">
          <div className="row"><strong>Credit improvement plan</strong><span>{completed}/3 steps ready</span></div>
          <div className="portalProgressTrack"><div style={{ width: `${progress}%` }} /></div>
          <div className="portalMilestones"><span className={analysisConsent ? 'done' : ''}>Authorization</span><span className={reports.length ? 'done' : ''}>Reports</span><span className={ready ? 'done' : ''}>Review ready</span></div>
        </div>
      </section>

      <section className="portalCardGrid">
        <Link className="portalMetricCard" href="/portal/reports"><span>Credit reports</span><strong>{reports.length}</strong><small>{reports.length ? 'Securely received' : 'Upload your first report'}</small><b>View reports →</b></Link>
        <Link className="portalMetricCard" href="/portal/progress"><span>Plan status</span><strong className="metricText">{ready ? 'On track' : 'Needs action'}</strong><small>Follow your customer-safe milestones</small><b>View progress →</b></Link>
        <Link className="portalMetricCard" href="/portal/documents"><span>Documents</span><strong className="metricText">Secure</strong><small>Agreements, letters and shared files</small><b>View documents →</b></Link>
        <Link className="portalMetricCard" href="/portal/payments"><span>Payments</span><strong className="metricText">Protected</strong><small>Only approved invoices are presented</small><b>View billing →</b></Link>
      </section>

      <section className="portalNextCard">
        <div>
          <div className="eyebrow">WHAT HAPPENS NEXT</div>
          <h2>{ready ? 'Your file is ready for analysis' : 'Finish your secure intake'}</h2>
          <p>{ready ? 'Your authorization and credit report are on file. You do not need to upload them again.' : 'We only need the items shown below. Your credit bureau passwords are never requested.'}</p>
        </div>
        <div className="portalSteps">
          <div className={analysisConsent ? 'portalStep complete' : 'portalStep'}><i>{analysisConsent ? '✓' : '1'}</i><div><strong>Authorize analysis</strong><span>{analysisConsent ? 'Completed' : 'Required before analysis'}</span></div><Link href="/portal/consents">Open</Link></div>
          <div className={reports.length ? 'portalStep complete' : 'portalStep'}><i>{reports.length ? '✓' : '2'}</i><div><strong>Provide your credit report</strong><span>{reports.length ? `${reports.length} report(s) received` : 'Upload it securely'}</span></div><Link href="/portal/reports">Open</Link></div>
          <div className={ready ? 'portalStep complete' : 'portalStep'}><i>{ready ? '✓' : '3'}</i><div><strong>Follow your progress</strong><span>{ready ? 'Ready for review' : 'Available after intake'}</span></div><Link href="/portal/progress">Open</Link></div>
        </div>
      </section>
    </main>
  );
}