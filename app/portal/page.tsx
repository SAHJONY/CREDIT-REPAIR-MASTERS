import Link from 'next/link';
import { consentIsActive, requireCustomerPortalSession } from '@/lib/customer-portal';
import { getPlatformStore } from '@/lib/platform-store';
import styles from './portal-dashboard.module.css';

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
  const documents = evidence.filter((e) => e.type !== 'credit_report');
  const ready = analysisConsent && reports.length > 0;
  const completed = Number(analysisConsent) + Number(reports.length > 0) + Number(ready);
  const progress = Math.round((completed / 3) * 100);
  const firstName = portal.client.displayName?.split(' ')[0] || 'Client';

  const steps = [
    { label: 'Account Activated', detail: 'Secure portal', state: 'done' },
    { label: 'Reports Received', detail: reports.length ? `${reports.length} received` : 'Pending', state: reports.length ? 'done' : 'current' },
    { label: 'Analysis Ready', detail: analysisConsent ? 'Authorized' : 'Authorization needed', state: ready ? 'done' : analysisConsent ? 'current' : 'pending' }
  ];

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.crest}>850</div>
          <div className={styles.brandText}><strong>NEW850.COM</strong><span>FINANCIAL READINESS</span></div>
        </div>

        <nav className={styles.nav} aria-label="Client portal navigation">
          <Link href="/portal"><span className={styles.icon}>⌂</span>Dashboard</Link>
          <Link href="/portal/passport"><span className={styles.icon}>◎</span>Financial Passport</Link>
          <Link href="/portal/progress"><span className={styles.icon}>▥</span>Readiness Progress</Link>
          <Link href="/portal/reports"><span className={styles.icon}>▥</span>Reports & Scores</Link>
          <Link href="/portal/documents"><span className={styles.icon}>▤</span>Documents</Link>
          <Link href="/portal/payments"><span className={styles.icon}>▱</span>Payments</Link>
          <Link href="/portal/progress"><span className={styles.icon}>◇</span>Education Center</Link>
          <Link href="/portal/account"><span className={styles.icon}>◯</span>Account</Link>
        </nav>

        <div className={styles.clientBox}>
          <div className={styles.tiny}>Welcome back,</div>
          <div className={styles.clientName}>{portal.client.displayName}</div>
          <div className={styles.tiny}>Private client portal</div>
        </div>

        <div className={styles.advisorBox}>
          <div className={styles.tiny}>Dedicated Support</div>
          <strong>New850.com</strong>
          <div className={styles.tiny}>Secure financial readiness support</div>
          <span className={styles.online}>● Portal online</span>
        </div>

        <div className={styles.helpBox}>
          <div><div className={styles.tiny}>Need help?</div><strong>Review your account</strong></div>
          <Link className={styles.helpButton} href="/portal/account">Open Account</Link>
        </div>
      </aside>

      <section className={styles.content}>
        <div className={styles.hero}>
          <div className={styles.heroImage} aria-hidden="true" />
          <div className={styles.heroGlow} aria-hidden="true" />
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <p>Good evening,</p>
              <h1><span>{firstName} 👋</span></h1>
              <p>Here’s where your financial readiness<br/>plan stands today.</p>
              <Link className={styles.primary} href="/portal/passport">Open Financial Passport <span>→</span></Link>
            </div>

            <div className={styles.scoreCard}>
              <h3>Overall Plan Health</h3>
              <div>
                <div><span className={styles.scoreValue}>{progress}%</span><span className={styles.scoreState}>{ready ? 'On track' : 'Building'}</span></div>
                <div className={styles.scoreMeta}>↑ Secure milestones completed<b>Next Goal: Readiness Review</b>{completed}/3 intake milestones complete</div>
              </div>
              <div className={styles.ring} style={{ '--p': `${progress * 3.6}deg` } as React.CSSProperties}>
                <div className={styles.ringContent}><b>{progress}%</b><small>to intake ready</small></div>
              </div>
            </div>
          </div>
        </div>

        <main className={styles.main}>
          <section className={styles.metrics}>
            <Link className={styles.metric} href="/portal/passport">
              <div className={styles.metricHeader}><span className={styles.metricIcon}>◎</span>Financial Passport</div>
              <div className={styles.metricValue}>{progress}%</div>
              <small>Reusable readiness profile</small>
              <div className={styles.metricLink}>Open Passport →</div>
            </Link>
            <Link className={styles.metric} href="/portal/reports">
              <div className={styles.metricHeader}><span className={styles.metricIcon}>▣</span>Credit Reports</div>
              <div className={styles.metricValue}>{reports.length}</div>
              <small>{reports.length ? 'Reports securely received' : 'Upload your first report'}</small>
              <div className={styles.metricLink}>View Reports →</div>
            </Link>
            <Link className={styles.metric} href="/portal/progress">
              <div className={styles.metricHeader}><span className={styles.metricIcon}>↗</span>Readiness Progress</div>
              <div className={styles.metricValue}>{ready ? 'Ready' : completed}</div>
              <small>{ready ? 'File ready for review' : 'Secure intake milestones active'}</small>
              <div className={styles.metricLink}>View Progress →</div>
            </Link>
            <Link className={styles.metric} href="/portal/documents">
              <div className={styles.metricHeader}><span className={styles.metricIcon}>▤</span>Documents</div>
              <div className={styles.metricValue}>{documents.length}</div>
              <small>Agreements, letters and shared files</small>
              <div className={styles.metricLink}>View Documents →</div>
            </Link>
          </section>

          <section className={styles.next}>
            <div className={styles.nextLeft}>
              <div className={styles.eyebrow}>Next Up</div>
              <h2>{ready ? 'Your file is ready for the next readiness review.' : reports.length ? 'We’re reviewing your submitted financial information.' : 'Complete your secure intake.'}</h2>
              <p>{ready ? 'Your authorization and report are on file. Your readiness workflow can continue without another upload.' : 'Complete the remaining secure steps. Credit bureau passwords are never requested.'}</p>
              <strong className={styles.calm}>◈ {ready ? 'Your next recommendation will appear in your readiness plan.' : 'Your next required action is shown in your progress.'}</strong>
            </div>
            <div className={styles.timeline}>
              {steps.map((step) => (
                <div key={step.label} className={`${styles.step} ${step.state === 'done' ? styles.done : step.state === 'current' ? styles.current : ''}`}>
                  <div className={styles.dot}>{step.state === 'done' ? '✓' : '•'}</div>
                  <div><b>{step.label}</b><small>{step.detail}</small></div>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.bottom}>
            <div className={styles.activity}>
              <h3>Recent Activity</h3>
              <div className={styles.activityRow}><span>Current</span><span>Portal account active</span><span>Completed</span></div>
              <div className={styles.activityRow}><span>Current</span><span>Credit analysis authorization</span><span>{analysisConsent ? 'Completed' : 'Pending'}</span></div>
              <div className={styles.activityRow}><span>Current</span><span>Credit reports</span><span>{reports.length ? 'Received' : 'Pending'}</span></div>
              <div className={styles.activityRow}><span>Current</span><span>Readiness intake</span><span>{ready ? 'Ready' : 'In progress'}</span></div>
            </div>
            <div className={styles.future}>
              <div className={styles.futureContent}>
                <h2>Build Your Financial Future</h2>
                <p>Your readiness profile, goals, documents and progress stay together in one private experience before you compare financing options.</p>
                <Link href="/portal/passport">Explore Your Financial Passport →</Link>
              </div>
            </div>
          </section>
        </main>
      </section>
    </div>
  );
}
