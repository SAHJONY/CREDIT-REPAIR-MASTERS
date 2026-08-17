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
    <main className="portalShell cinematicPortal">
      <header className="portalHeader cinematicHeader">
        <div className="cinematicWordmark"><span>CRM</span><div><b>CREDIT REPAIR</b><small>MASTERS</small></div></div>
        <PortalNav />
      </header>

      <section className="cinematicHero">
        <div className="cinematicHeroImage" aria-hidden="true" />
        <div className="cinematicShade" />
        <div className="cinematicCopy">
          <div className="cinematicEyebrow">PRIVATE CLIENT EXPERIENCE</div>
          <h1>Good evening,<br/><em>{portal.client.displayName}</em></h1>
          <p>Here’s where your credit improvement plan stands today.</p>
          <Link className="goldButton" href="/portal/progress">View your progress <span>→</span></Link>
        </div>
        <div className="cinematicScoreGlass">
          <div><small>PLAN READINESS</small><strong>{progress}%</strong><span>{ready ? 'On track' : 'Building'}</span></div>
          <div className="cinematicRing" style={{'--progress': `${progress * 3.6}deg`} as React.CSSProperties}><b>{progress}%</b><small>to ready</small></div>
          <p>{completed}/3 secure intake milestones complete</p>
        </div>
      </section>

      <section className="cinematicCards">
        <Link href="/portal/reports" className="cinematicCard blueCard"><i>▣</i><span>Credit Reports</span><strong>{reports.length}</strong><small>{reports.length ? 'Securely received' : 'Upload your first report'}</small><b>View Reports →</b></Link>
        <Link href="/portal/progress" className="cinematicCard violetCard"><i>↗</i><span>Plan Status</span><strong className="textMetric">{ready ? 'On Track' : 'Action'}</strong><small>Follow every milestone</small><b>View Progress →</b></Link>
        <Link href="/portal/documents" className="cinematicCard emeraldCard"><i>▤</i><span>Documents</span><strong className="textMetric">Secure</strong><small>Agreements, letters & reports</small><b>View Documents →</b></Link>
        <Link href="/portal/payments" className="cinematicCard goldCard"><i>▱</i><span>Payments</span><strong className="textMetric">Protected</strong><small>Approved invoices only</small><b>View Billing →</b></Link>
      </section>

      <section className="cinematicNext">
        <div className="cinematicNextCopy">
          <div className="cinematicEyebrow goldText">NEXT UP</div>
          <h2>{ready ? 'Your file is ready for the next review.' : 'Complete your secure intake.'}</h2>
          <p>{ready ? 'Your authorization and report are on file. Our workflow can continue without another upload.' : 'Complete the remaining secure steps below. We never request your credit bureau passwords.'}</p>
          <strong className="calmStatus">◈ {ready ? 'You don’t need to do anything right now.' : 'Your next required action is shown on the right.'}</strong>
        </div>
        <div className="cinematicTimeline">
          <div className={analysisConsent ? 'timelineNode done' : 'timelineNode current'}><i>{analysisConsent ? '✓' : '1'}</i><div><b>Authorization</b><small>{analysisConsent ? 'Completed' : 'Required'}</small></div><Link href="/portal/consents">Open</Link></div>
          <div className={reports.length ? 'timelineNode done' : 'timelineNode current'}><i>{reports.length ? '✓' : '2'}</i><div><b>Reports received</b><small>{reports.length ? `${reports.length} secure report(s)` : 'Upload securely'}</small></div><Link href="/portal/reports">Open</Link></div>
          <div className={ready ? 'timelineNode done' : 'timelineNode'}><i>{ready ? '✓' : '3'}</i><div><b>Review ready</b><small>{ready ? 'Ready for analysis' : 'Pending intake'}</small></div><Link href="/portal/progress">Open</Link></div>
        </div>
      </section>

      <section className="cinematicFuture">
        <div><div className="cinematicEyebrow">FINANCIAL FUTURE</div><h2>Build toward what comes next.</h2><p>Better credit can open doors to better opportunities. Your plan, documents and progress stay together in one private experience.</p><Link className="glassButton" href="/portal/progress">Explore your plan →</Link></div>
      </section>
    </main>
  );
}