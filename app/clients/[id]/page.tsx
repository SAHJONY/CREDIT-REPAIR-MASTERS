import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ConsentForm } from '@/components/consent-form';
import { CreditReportImportForm } from '@/components/credit-report-import-form';
import { EvidenceUploadForm } from '@/components/evidence-upload-form';
import { SignOutButton } from '@/components/sign-out-button';
import { freeCreditDataProviders } from '@/lib/credit-data-providers';
import { getBusinessSession } from '@/lib/session-access';
import { getPlatformStore } from '@/lib/platform-store';

export const dynamic = 'force-dynamic';

function activeConsent(consent: { granted: boolean; revokedAt?: string; expiresAt?: string }) {
  if (!consent.granted || consent.revokedAt) return false;
  return !consent.expiresAt || Date.parse(consent.expiresAt) > Date.now();
}

const preferredProviderOrder = ['annual-credit-report', 'equifax', 'experian', 'transunion'];

export default async function ClientWorkspace({ params }: { params: Promise<{ id: string }> }) {
  const session = await getBusinessSession();
  if (!session) redirect('/auth/sign-in');
  if (session.mfaRequired && !session.mfaAssured) redirect('/auth/mfa');
  const { id } = await params;
  const store = getPlatformStore();
  const client = await store.getClient(session.organizationId, id);
  if (!client) notFound();

  const [consents, evidence, audit] = await Promise.all([
    store.listConsents(session.organizationId, client.id),
    store.listEvidence(session.organizationId, client.id),
    store.listAudit(session.organizationId, 50)
  ]);
  const clientAudit = audit.filter((entry) => entry.resourceId === client.id || entry.metadata?.clientId === client.id).slice(0, 12);
  const vaultConfigured = Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
  const creditAnalysisAuthorized = consents.some((item) => item.scope === 'credit_report_analysis' && activeConsent(item));
  const creditReports = evidence.filter((item) => item.type === 'credit_report');
  const reportUploaded = creditReports.length > 0;
  const readyForAnalysis = creditAnalysisAuthorized && reportUploaded && vaultConfigured;
  const reportProviders = freeCreditDataProviders
    .filter((provider) => provider.freeConsumerDisclosure)
    .sort((a, b) => {
      const aIndex = preferredProviderOrder.indexOf(a.id);
      const bIndex = preferredProviderOrder.indexOf(b.id);
      if (aIndex === -1 && bIndex === -1) return a.name.localeCompare(b.name);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  const providerOptions = reportProviders.map(({ id: providerId, name }) => ({ id: providerId, name }));

  const intakeSteps = [
    { label: '1. Obtain report', ready: reportUploaded, detail: reportUploaded ? `${creditReports.length} report${creditReports.length === 1 ? '' : 's'} imported` : 'Client obtains report from an official source' },
    { label: '2. Record consent', ready: creditAnalysisAuthorized, detail: creditAnalysisAuthorized ? 'Credit-report-analysis consent active' : 'Document client authorization before upload' },
    { label: '3. Secure upload', ready: reportUploaded && vaultConfigured, detail: reportUploaded ? 'Private report stored in Evidence Vault' : vaultConfigured ? 'Vault ready for private upload' : 'Private vault configuration required' },
    { label: '4. AI intake status', ready: readyForAnalysis, detail: readyForAnalysis ? 'Ready for AI analysis' : 'Waiting for report + consent + vault readiness' }
  ];

  return (
    <main>
      <header className="appHeader">
        <div><div className="kicker">CLIENT WORKSPACE / {client.id}</div><h1>{client.displayName}</h1><p className="subtitle">{client.kind} · {client.state} · {client.status}</p></div>
        <div className="headerActions"><Link className="secondaryButton" href="/clients">All clients</Link><Link className="secondaryButton" href="/dashboard">Dashboard</Link><SignOutButton /></div>
      </header>

      <section className="grid">
        <div className="card span3"><div className="label">Evidence</div><div className="value">{evidence.length}</div><div className="small">{evidence.filter((item) => item.verification === 'verified').length} verified</div></div>
        <div className="card span3"><div className="label">Credit reports</div><div className="value">{creditReports.length}</div><div className="small">consumer-controlled imports</div></div>
        <div className="card span3"><div className="label">Analysis consent</div><div className="value statusValue">{creditAnalysisAuthorized ? 'ACTIVE' : 'REQUIRED'}</div><div className="small">credit_report_analysis</div></div>
        <div className="card span3"><div className="label">AI intake</div><div className="value statusValue">{readyForAnalysis ? 'READY' : 'WAITING'}</div><div className="small">free-report production path</div></div>

        <div className="card span12">
          <div className="label">Free-report launch workflow</div>
          <h2>Client intake checklist</h2>
          <div className="grid" style={{ marginTop: 14 }}>
            {intakeSteps.map((step) => (
              <div className="card span3" key={step.label}>
                <span className={`pill ${step.ready ? 'low' : 'medium'}`}>{step.ready ? 'ready' : 'pending'}</span>
                <h3 style={{ marginTop: 10 }}>{step.label}</h3>
                <div className="small">{step.detail}</div>
              </div>
            ))}
          </div>
          <div className="small" style={{ marginTop: 12 }}>Free consumer disclosures are the active launch path. A contracted bureau API is optional for this workflow and remains required only for unattended live bureau ingestion.</div>
        </div>

        <div className="card span6"><div className="label">Consent control</div><h2>Record authorization</h2><ConsentForm clientId={client.id} /></div>
        <div className="card span6"><div className="label">Evidence vault</div><h2>Upload private evidence</h2>{vaultConfigured ? <><EvidenceUploadForm clientId={client.id} /><div className="small" style={{ marginTop: 10 }}>Uploads remain unverified until a separate verification step is completed.</div></> : <div className="emptyState">Private evidence upload is disabled until the Vercel Blob credential is configured. Existing metadata remains visible, but no document bytes are stored insecurely.</div>}</div>

        <div className="card span12">
          <div className="label">Credit report intake</div>
          <h2>Free report sources + secure import</h2>
          <p className="small">Start with AnnualCreditReport.com or the three nationwide bureaus. Specialty reporting companies remain available when the case requires them. The client obtains the report directly; New850 does not scrape bureau portals or bypass consumer authentication.</p>
          <div className="grid" style={{ marginTop: 14 }}>
            {reportProviders.map((provider, index) => (
              <div className="card span4" key={provider.id}>
                <div className="label">{index < 4 ? 'Primary source' : 'Specialty source'}</div>
                <strong>{provider.name}</strong>
                <div className="small" style={{ marginTop: 6 }}>{provider.notes}</div>
                <div className="headerActions" style={{ marginTop: 10 }}>
                  <a className="secondaryButton" href={provider.links.report || provider.officialUrl} target="_blank" rel="noreferrer">Get report</a>
                  {provider.links.dispute ? <a className="secondaryButton" href={provider.links.dispute} target="_blank" rel="noreferrer">Dispute</a> : null}
                  {provider.links.freeze ? <a className="secondaryButton" href={provider.links.freeze} target="_blank" rel="noreferrer">Freeze</a> : null}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 18 }}>
            {!creditAnalysisAuthorized ? (
              <div className="emptyState">Step 2 pending: record active credit-report-analysis consent before importing a consumer report. The upload API enforces this requirement server-side.</div>
            ) : !vaultConfigured ? (
              <div className="emptyState">Credit report import is ready, but document bytes remain blocked until the private Vercel Blob vault credential is configured.</div>
            ) : (
              <CreditReportImportForm clientId={client.id} providers={providerOptions} />
            )}
          </div>
        </div>

        <div className="card span6"><div className="label">Consent ledger</div><h2>Recorded consent</h2>
          {consents.length ? consents.map((item) => <div className="listRow" key={item.id}><div><strong>{item.scope.replaceAll('_', ' ')}</strong><div className="small">Source: {item.source} · {new Date(item.grantedAt).toLocaleString()}</div></div><span className={`pill ${item.granted ? 'low' : 'high'}`}>{item.granted ? 'granted' : 'denied'}</span></div>) : <div className="emptyState">No consent records yet.</div>}
        </div>

        <div className="card span6"><div className="label">Evidence ledger</div><h2>Documents & records</h2>
          {evidence.length ? evidence.map((item) => <div className="listRow" key={item.id}><div><strong>{item.label}</strong><div className="small">{item.type.replaceAll('_', ' ')} · {new Date(item.createdAt).toLocaleString()}</div></div><span className={`pill ${item.verification === 'verified' ? 'low' : item.verification === 'rejected' ? 'high' : 'medium'}`}>{item.verification}</span></div>) : <div className="emptyState">No evidence records yet.</div>}
        </div>

        <div className="card span12"><div className="label">Client audit trail</div><h2>Recent controlled activity</h2>
          {clientAudit.length ? clientAudit.map((entry) => <div className="listRow" key={entry.id}><div><strong>{entry.action}</strong><div className="small">{entry.actorType}:{entry.actorId} · {new Date(entry.createdAt).toLocaleString()}</div></div><span className={`pill ${entry.decision === 'blocked' ? 'high' : entry.decision === 'approval_required' ? 'medium' : 'low'}`}>{entry.decision || 'logged'}</span></div>) : <div className="emptyState">No client-specific audit events yet.</div>}
        </div>
      </section>
    </main>
  );
}
