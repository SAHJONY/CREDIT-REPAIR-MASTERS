import Link from 'next/link';
import { consentIsActive, requireCustomerPortalSession } from '@/lib/customer-portal';
import { getPlatformStore } from '@/lib/platform-store';
import './portal-dashboard.css';

export const dynamic = 'force-dynamic';

export default async function PortalHome() {
  const portal = await requireCustomerPortalSession();
  const store = getPlatformStore();
  const [consents, evidence] = await Promise.all([
    store.listConsents(portal.organizationId, portal.client.id),
    store.listEvidence(portal.organizationId, portal.client.id)
  ]);

  const analysisConsent = consents.some((consent) => consent.scope === 'credit_report_analysis' && consentIsActive(consent));
  const reports = evidence.filter((item) => item.type === 'credit_report');
  const ready = analysisConsent && reports.length > 0;
  const completed = Number(analysisConsent) + Number(reports.length > 0) + Number(ready);
  const progress = Math.round((completed / 3) * 100);
  const ringDegrees = Math.round((progress / 100) * 360);
  const firstName = portal.client.displayName.split(' ')[0] || portal.client.displayName;

  const activity = [
    analysisConsent ? 'Credit analysis authorization active' : 'Credit analysis authorization pending',
    reports.length ? `${reports.length} credit report${reports.length === 1 ? '' : 's'} received` : 'Credit report upload pending',
    ready ? 'File ready for review' : 'Secure intake in progress'
  ];

  return (
    <div className="crmPortal">
      <aside className="crmSidebar">
        <div className="crmBrand">
          <strong>CREDIT REPAIR</strong>
          <span>MASTERS</span>
          <div className="crmCrest">CRM</div>
        </div>

        <nav className="crmNav" aria-label="Customer portal">
          <Link href="/portal">⌂ &nbsp; Dashboard</Link>
          <Link href="/portal/progress">↗ &nbsp; Credit Progress</Link>
          <Link href="/portal/reports">▥ &nbsp; Reports & Scores</Link>
          <Link href="/portal/disputes">◉ &nbsp; Disputes</Link>
          <Link href="/portal/documents">▤ &nbsp; Documents</Link>
          <Link href="/portal/payments">▣ &nbsp; Payments</Link>
          <Link href="/portal/education">◇ &nbsp; Education</Link>
          <Link href="/portal/account">○ &nbsp; Account</Link>
        </nav>

        <div className="crmSideCard">
          <strong>{portal.client.displayName}</strong>
          <small>Secure client portal</small>
          <small>{ready ? 'File ready for review' : 'Intake in progress'}</small>
        </div>
      </aside>

      <main className="crmMain">
        <div className="crmTopbar" aria-label="Portal actions">
          <div className="crmIconButton" title="Notifications">♢</div>
          <Link className="crmIconButton" href="/portal/account" title="Account">○</Link>
        </div>

        <section className="crmHero">
          <div className="crmHeroCopy">
            <div className="crmGreeting">Good evening,<strong>{firstName} 👋</strong></div>
            <p>Here is where your credit improvement plan stands today. Your portal shows only verified activity from your file.</p>
            <Link className="crmGoldButton" href="/portal/progress">View Your Progress →</Link>
          </div>

          <div className="crmHealth">
            <div className="crmHealthTop">
              <div>
                <div className="crmHealthMeta">OVERALL PLAN HEALTH</div>
                <div className="crmHealthValue">{progress}%<span>{ready ? 'On track' : 'In progress'}</span></div>
                <div className="crmHealthMeta">Based on completed secure-intake milestones</div>
              </div>
              <div className="crmRingWrap">
                <div className="crmRing" style={{ '--p': `${ringDegrees}deg` } as React.CSSProperties} />
                <div className="crmRingText">{progress}%<small>to review-ready</small></div>
              </div>
            </div>
            <div className="crmHealthMeta" style={{ marginTop: 16 }}>
              Next goal: {ready ? 'Results review' : analysisConsent ? 'Receive credit report' : 'Authorize analysis'}
            </div>
          </div>
        </section>

        <section className="crmCardGrid">
          <article className="crmMetric">
            <div className="crmMetricIcon">▥</div>
            <span>Credit Reports</span>
            <strong>{reports.length}</strong>
            <small>{reports.length ? 'Securely received' : 'No report received yet'}</small>
            <Link href="/portal/reports">View Reports →</Link>
          </article>
          <article className="crmMetric">
            <div className="crmMetricIcon">◈</div>
            <span>Plan Status</span>
            <strong>{ready ? 'Ready' : 'Active'}</strong>
            <small>{ready ? 'Ready for review' : 'Secure intake underway'}</small>
            <Link href="/portal/progress">View Progress →</Link>
          </article>
          <article className="crmMetric">
            <div className="crmMetricIcon">▤</div>
            <span>Documents</span>
            <strong>Secure</strong>
            <small>Agreements, letters and shared files</small>
            <Link href="/portal/documents">View Documents →</Link>
          </article>
          <article className="crmMetric">
            <div className="crmMetricIcon">▣</div>
            <span>Payments</span>
            <strong>Portal</strong>
            <small>Only approved invoices are presented</small>
            <Link href="/portal/payments">View Billing →</Link>
          </article>
        </section>

        <section className="crmProgressCard">
          <div>
            <div className="crmHealthMeta">NEXT UP</div>
            <h2>{ready ? 'Your file is ready for analysis.' : 'We are completing your secure intake.'}</h2>
            <p>{ready ? 'Your authorization and credit report are on file. No duplicate upload is needed.' : 'Complete the remaining verified steps below so your file can move into review.'}</p>
          </div>
          <div className="crmProgressSteps">
            <div className={`crmProgressStep ${analysisConsent ? 'done' : 'current'}`}><div className="crmProgressDot">{analysisConsent ? '✓' : '1'}</div><strong>Authorization</strong><br/><span>{analysisConsent ? 'Complete' : 'Current'}</span></div>
            <div className={`crmProgressStep ${reports.length ? 'done' : analysisConsent ? 'current' : ''}`}><div className="crmProgressDot">{reports.length ? '✓' : '2'}</div><strong>Reports</strong><br/><span>{reports.length ? 'Received' : 'Pending'}</span></div>
            <div className={`crmProgressStep ${ready ? 'done' : reports.length ? 'current' : ''}`}><div className="crmProgressDot">{ready ? '✓' : '3'}</div><strong>Analysis</strong><br/><span>{ready ? 'Ready' : 'Pending'}</span></div>
            <div className={`crmProgressStep ${ready ? 'current' : ''}`}><div className="crmProgressDot">4</div><strong>Results Review</strong><br/><span>{ready ? 'Next' : 'Upcoming'}</span></div>
          </div>
        </section>

        <section className="crmBottomGrid">
          <article className="crmPanel">
            <h2>Recent Activity</h2>
            {activity.map((item, index) => (
              <div className="crmActivityRow" key={item}>
                <div><small>Step {index + 1}</small><br/>{item}</div>
                <span className={index < completed ? 'crmStatus' : ''}>{index < completed ? 'Completed' : 'Pending'}</span>
              </div>
            ))}
          </article>
          <article className="crmPanel crmEducation">
            <div className="crmHealthMeta">EDUCATION CENTER</div>
            <h2>Unlock Your Financial Future</h2>
            <p>Learn how credit reports, disputes, utilization and payment history work so you can make informed decisions throughout the process.</p>
            <Link href="/portal/education">Explore Education Center →</Link>
          </article>
        </section>
      </main>
    </div>
  );
}
