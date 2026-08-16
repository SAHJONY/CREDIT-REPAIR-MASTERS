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

  return (
    <main>
      <header className="appHeader"><div><div className="kicker">MY CREDIT REPAIR MASTERS</div><h1>Hello, {portal.client.displayName}</h1><p className="subtitle">Your secure workspace for reports, documents, authorizations, and progress.</p></div><PortalNav /></header>
      <section className="grid">
        <div className="card span4"><div className="label">Current status</div><div className="value statusValue">{portal.client.status}</div><div className="small">{portal.client.state} · {portal.client.kind}</div></div>
        <div className="card span4"><div className="label">Credit reports</div><div className="value">{reports.length}</div><div className="small">securely imported</div></div>
        <div className="card span4"><div className="label">Analysis readiness</div><div className="value statusValue">{ready ? 'READY' : 'ACTION NEEDED'}</div><div className="small">report + active consent required</div></div>
        <div className="card span12"><div className="label">What to do next</div><h2>{ready ? 'Your file is ready for analysis' : 'Complete your intake'}</h2><div className="grid">
          <div className="card span4"><strong>1. Authorize analysis</strong><div className="small">{analysisConsent ? 'Complete' : 'Required before report analysis.'}</div><Link className="secondaryButton" href="/portal/consents">Manage consent</Link></div>
          <div className="card span4"><strong>2. Upload your report</strong><div className="small">{reports.length ? `${reports.length} report(s) received` : 'Get a free report and upload it securely.'}</div><Link className="secondaryButton" href="/portal/reports">Reports</Link></div>
          <div className="card span4"><strong>3. Follow progress</strong><div className="small">See customer-safe milestones without internal staff tooling.</div><Link className="secondaryButton" href="/portal/progress">View progress</Link></div>
        </div></div>
      </section>
    </main>
  );
}
