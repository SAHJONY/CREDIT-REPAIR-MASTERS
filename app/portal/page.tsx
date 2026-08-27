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

  const nextAction = !analysisConsent
    ? { href: '/portal/consents', label: 'Authorize analysis', title: 'Authorize your readiness analysis', detail: 'Review and approve the permission New850 needs before analyzing your credit report.' }
    : !reports.length
      ? { href: '/portal/reports', label: 'Get & upload report', title: 'Add your credit report', detail: 'Get your report from an official source and upload it securely. We never ask for bureau passwords.' }
      : { href: '/portal/progress', label: 'Open action plan', title: 'Review your action plan', detail: 'Your intake is ready. See what New850 recommends next and monitor progress in one place.' };

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
          <Link href="/portal"><span className={styles.icon}>⌂</span>Home</Link>
          <Link href="/portal/passport"><span className={styles.icon}>◎</span>My Readiness</Link>
          <Link href="/portal/progress"><span className={styles.icon}>↗</span>Action Plan</Link>
          <Link href="/portal/documents"><span className={styles.icon}>▤</span>Documents & Letters</Link>
          <Link href="/portal/marketplace"><span className={styles.icon}>◇</span>Marketplace</Link>
          <Link href="/portal/payments"><span className={styles.icon}>▱</span>Payments</Link>
          <Link href="/portal/reports"><span className={styles.icon}>▥</span>Credit Reports</Link>
          <Link href="/portal/account"><span className={styles.icon}>◯</span>Account & Help</Link>
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
          <div><div className={styles.tiny}>Need help?</div><strong>Account & support</strong></div>
          <Link className={styles.helpButton} href="/portal/account">Get Help</Link>
        </div>
      </aside>

      <section className={styles.content}>
        <div className={styles.hero}>
          <div className={styles.heroImage} aria-hidden="true" />
          <div className={styles.heroGlow} aria-hidden="true" />
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <p>Welcome back,</p>
              <h1><span>{firstName} 👋</span></h1>
              <p>Your next step is ready.<br/>Keep moving toward your financing goal.</p>
              <Link className={styles.primary} href={nextAction.href}>{nextAction.label} <span>→</span></Link>
            </div>

            <div className={styles.scoreCard}>
              <h3>Readiness Setup</h3>
              <div>
                <div><span className={styles.scoreValue}>{progress}%</span><span className={styles.scoreState}>{ready ? 'On track' : 'Building'}</span></div>
                <div className={styles.scoreMeta}>Secure milestones completed<b>Next: {nextAction.label}</b>{completed}/3 intake milestones complete</div>
              </div>
              <div className={styles.ring} style={{ '--p': `${progress * 3.6}deg` } as React.CSSProperties}>
                <div className={styles.ringContent}><b>{progress}%</b><small>setup complete</small></div>
              </div>
            </div>
          </div>
        </div>

        <main className={styles.main}>
          <section className={styles.next}>
            <div className={styles.nextLeft}>
              <div className={styles.eyebrow}>DO THIS NEXT</div>
              <h2>{nextAction.title}</h2>
              <p>{nextAction.detail}</p>
              <Link className={styles.primary} href={nextAction.href}>{nextAction.label} <span>→</span></Link>
              <strong className={styles.calm}>◈ One clear next step at a time. Your portal updates as your file moves forward.</strong>
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

          <section className={styles.metrics}>
            <Link className={styles.metric} href="/portal/passport">
              <div className={styles.metricHeader}><span className={styles.metricIcon}>◎</span>My Readiness</div>
              <div className={styles.metricValue}>{progress}%</div>
              <small>Your reusable financial readiness profile</small>
              <div className={styles.metricLink}>Open My Readiness →</div>
            </Link>
            <Link className={styles.metric} href="/portal/progress">
              <div className={styles.metricHeader}><span className={styles.metricIcon}>↗</span>Action Plan</div>
              <div className={styles.metricValue}>{ready ? 'Ready' : completed}</div>
              <small>{ready ? 'Your plan is ready for review' : 'Secure setup steps in progress'}</small>
              <div className={styles.metricLink}>See What To Do →</div>
            </Link>
            <Link className={styles.metric} href="/portal/documents">
              <div className={styles.metricHeader}><span className={styles.metricIcon}>▤</span>Documents & Letters</div>
              <div className={styles.metricValue}>{documents.length}</div>
              <small>Files, signature requests and letter status</small>
              <div className={styles.metricLink}>Open Documents →</div>
            </Link>
            <Link className={styles.metric} href="/portal/marketplace">
              <div className={styles.metricHeader}><span className={styles.metricIcon}>◇</span>Marketplace</div>
              <div className={styles.metricValue}>{ready ? 'Open' : 'Later'}</div>
              <small>Compare options when your readiness supports it</small>
              <div className={styles.metricLink}>Explore Marketplace →</div>
            </Link>
          </section>

          <section className={styles.bottom}>
            <div className={styles.activity}>
              <h3>Your Journey</h3>
              <div className={styles.activityRow}><span>1</span><span>Authorize secure analysis</span><span>{analysisConsent ? 'Completed' : 'Next'}</span></div>
              <div className={styles.activityRow}><span>2</span><span>Add your credit report</span><span>{reports.length ? 'Completed' : analysisConsent ? 'Next' : 'Waiting'}</span></div>
              <div className={styles.activityRow}><span>3</span><span>Follow your action plan</span><span>{ready ? 'Ready' : 'Waiting'}</span></div>
              <div className={styles.activityRow}><span>4</span><span>Compare financing options when ready</span><span>{ready ? 'Available' : 'Later'}</span></div>
            </div>
            <div className={styles.future}>
              <div className={styles.futureContent}>
                <h2>Everything in one place</h2>
                <p>Your readiness, action plan, reports, letters, payments and marketplace journey stay together in one private experience.</p>
                <Link href="/portal/progress">Open Your Action Plan →</Link>
              </div>
            </div>
          </section>
        </main>
      </section>
    </div>
  );
}
