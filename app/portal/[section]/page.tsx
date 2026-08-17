import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PortalNav } from '@/components/portal-nav';
import { PortalConsentForm } from '@/components/portal-consent-form';
import { PortalReportUploadForm } from '@/components/portal-report-upload-form';
import { consentIsActive, requireCustomerPortalSession } from '@/lib/customer-portal';
import { freeCreditDataProviders } from '@/lib/credit-data-providers';
import { documentMetadata, isDocumentShared, isManagedDocument } from '@/lib/document-sharing';
import { getPlatformStore } from '@/lib/platform-store';

export const dynamic = 'force-dynamic';
const sections = new Set(['onboarding','reports','documents','progress','consents','account']);

export default async function PortalSection({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!sections.has(section)) notFound();
  const portal = await requireCustomerPortalSession();
  const store = getPlatformStore();
  const [consents, evidence, audit] = await Promise.all([
    store.listConsents(portal.organizationId, portal.client.id),
    store.listEvidence(portal.organizationId, portal.client.id),
    store.listAudit(portal.organizationId, 500)
  ]);
  const analysisConsent = consents.some((c) => c.scope === 'credit_report_analysis' && consentIsActive(c));
  const reports = evidence.filter((e) => e.type === 'credit_report');
  const clientAudit = audit.filter((a) => a.metadata?.clientId === portal.client.id || a.resourceId === portal.client.id).slice(0, 20);
  const sharedDocuments = evidence.filter((e) => isManagedDocument(audit, e.id) && isDocumentShared(audit, e.id));
  const providers = freeCreditDataProviders.filter((p) => p.freeConsumerDisclosure);
  const preferred = providers.filter((p) => ['annual-credit-report','equifax','experian','transunion'].includes(p.id));
  const other = providers.filter((p) => !preferred.some((x) => x.id === p.id));

  let content;
  if (section === 'reports') content = <>
    <div className="card span12"><div className="label">Step 1</div><h2>Get your free credit report</h2><p className="small">Use the official consumer source directly. Never send us bureau passwords.</p><div className="grid">{preferred.map((p) => <div className="card span3" key={p.id}><strong>{p.name}</strong><div className="small">{p.notes}</div><a className="secondaryButton" href={p.links.report || p.officialUrl} target="_blank" rel="noreferrer">Open official source</a></div>)}</div></div>
    <div className="card span6"><div className="label">Step 2</div><h2>Authorize analysis</h2>{analysisConsent ? <div className="formSuccess">Credit report analysis authorization is active.</div> : <><div className="emptyState">Authorization is required before upload analysis.</div><Link className="secondaryButton" href="/portal/consents">Manage authorization</Link></>}</div>
    <div className="card span6"><div className="label">Step 3</div><h2>Upload securely</h2>{analysisConsent ? <PortalReportUploadForm providers={providers.map(({id,name}) => ({id,name}))} /> : <div className="emptyState">Complete Step 2 first.</div>}</div>
    <div className="card span12"><div className="label">Specialty reports</div><h2>Additional consumer reporting sources</h2><div className="grid">{other.map((p) => <div className="card span4" key={p.id}><strong>{p.name}</strong><div className="small">{p.notes}</div><a className="secondaryButton" href={p.links.report || p.officialUrl} target="_blank" rel="noreferrer">Official source</a></div>)}</div></div>
  </>;
  else if (section === 'consents') content = <><div className="card span6"><div className="label">Your authorizations</div><h2>Control what we may do</h2><PortalConsentForm /></div><div className="card span6"><div className="label">Consent history</div><h2>Recorded decisions</h2>{consents.length ? consents.map((c) => <div className="listRow" key={c.id}><div><strong>{c.scope.replaceAll('_',' ')}</strong><div className="small">{c.source} · {new Date(c.grantedAt).toLocaleString()}</div></div><span className={`pill ${c.granted ? 'low' : 'high'}`}>{c.granted ? 'granted' : 'denied'}</span></div>) : <div className="emptyState">No authorizations recorded.</div>}</div></>;
  else if (section === 'documents') content = <div className="card span12"><div className="label">Shared documents</div><h2>Your secure document center</h2><p className="small">Only documents explicitly shared with your customer profile appear here. Files remain private and require your authenticated portal session.</p>{sharedDocuments.length ? sharedDocuments.map((e) => { const metadata = documentMetadata(audit, e); return <div className="listRow" key={e.id}><div><strong>{e.label}</strong><div className="small">{metadata.category.replaceAll('_',' ')} · {metadata.filename || 'document'} · {new Date(e.createdAt).toLocaleString()}</div></div><div className="headerActions"><span className="pill low">SHARED</span><a className="primaryButton" href={`/api/documents/${encodeURIComponent(e.id)}/content`} target="_blank" rel="noreferrer">View / Download</a></div></div>; }) : <div className="emptyState">No documents have been shared with you yet.</div>}</div>;
  else if (section === 'progress') content = <><div className="card span4"><div className="label">Intake</div><div className="value statusValue">{analysisConsent && reports.length ? 'COMPLETE' : 'IN PROGRESS'}</div></div><div className="card span4"><div className="label">Analysis</div><div className="value statusValue">{analysisConsent && reports.length ? 'READY' : 'WAITING'}</div></div><div className="card span4"><div className="label">Case status</div><div className="value statusValue">{portal.client.status}</div></div><div className="card span12"><div className="label">Recent activity</div><h2>Your case timeline</h2>{clientAudit.length ? clientAudit.map((a) => <div className="listRow" key={a.id}><div><strong>{a.action.replaceAll('_',' ')}</strong><div className="small">{new Date(a.createdAt).toLocaleString()}</div></div><span className={`pill ${a.decision === 'blocked' ? 'high' : a.decision === 'approval_required' ? 'medium' : 'low'}`}>{a.decision || 'recorded'}</span></div>) : <div className="emptyState">Your timeline will appear as work progresses.</div>}</div></>;
  else if (section === 'account') content = <><div className="card span6"><div className="label">Portal account</div><h2>{portal.email}</h2><div className="small">Client ID: {portal.client.id}</div><div className="small">State: {portal.client.state}</div><div className="small">Status: {portal.client.status}</div></div><div className="card span6"><div className="label">Security</div><h2>Your privacy matters</h2><div className="guardrail">Your login is bound to one client profile. You cannot view staff tools or another customer's records. Never share bureau passwords with anyone.</div><Link className="secondaryButton" href="/auth/forgot-password">Reset password</Link></div></>;
  else content = <><div className="card span4"><div className="label">1. Authorization</div><div className="value statusValue">{analysisConsent ? 'DONE' : 'REQUIRED'}</div></div><div className="card span4"><div className="label">2. Credit report</div><div className="value statusValue">{reports.length ? 'RECEIVED' : 'REQUIRED'}</div></div><div className="card span4"><div className="label">3. Ready</div><div className="value statusValue">{analysisConsent && reports.length ? 'YES' : 'NOT YET'}</div></div><div className="card span12"><h2>Complete your secure intake</h2><p className="small">Start with authorization, obtain your report from an official source, then upload it to the private Evidence Vault.</p><Link className="primaryButton" href="/portal/reports">Continue intake</Link></div></>;

  return <main><header className="appHeader"><div><div className="kicker">CLIENT PORTAL / {section.toUpperCase()}</div><h1>{portal.client.displayName}</h1><p className="subtitle">Your information is tenant-scoped and visible only to authorized personnel and your own portal account.</p></div><PortalNav /></header><section className="grid">{content}</section></main>;
}