import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PortalNav } from '@/components/portal-nav';
import { PortalConsentForm } from '@/components/portal-consent-form';
import { PortalReportUploadForm } from '@/components/portal-report-upload-form';
import { PortalDocumentSignatureForm } from '@/components/portal-document-signature-form';
import { consentIsActive, requireCustomerPortalSession } from '@/lib/customer-portal';
import { freeCreditDataProviders } from '@/lib/credit-data-providers';
import { documentMetadata, isDocumentShared, isManagedDocument } from '@/lib/document-sharing';
import { clientDocumentStatusLabel, documentWorkflowState, signatureMatchesCurrentVersion } from '@/lib/document-workflow';
import { getPlatformStore } from '@/lib/platform-store';

export const dynamic = 'force-dynamic';
const sections = new Set(['onboarding','reports','documents','progress','consents','account']);

const sectionCopy: Record<string, { eyebrow: string; title: string; subtitle: string }> = {
  onboarding: { eyebrow: 'GET STARTED', title: 'Secure intake', subtitle: 'Complete only the steps needed to prepare your file.' },
  reports: { eyebrow: 'MY CREDIT', title: 'Credit reports', subtitle: 'Get your reports from official sources and upload them securely.' },
  documents: { eyebrow: 'SECURE FILES', title: 'Documents & Letters', subtitle: 'Review shared files and electronically sign client-specific letters when New850 requests your authorization.' },
  progress: { eyebrow: 'YOUR PLAN', title: 'Progress', subtitle: 'See where your readiness plan stands and what happens next.' },
  consents: { eyebrow: 'YOUR CHOICES', title: 'Authorizations', subtitle: 'Control the permissions you have granted for your service and marketplace sharing.' },
  account: { eyebrow: 'PROFILE & SECURITY', title: 'Account', subtitle: 'Manage your portal access and review your account details.' }
};

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
  const intakeReady = analysisConsent && reports.length > 0;
  const copy = sectionCopy[section];

  let content;
  if (section === 'reports') content = <>
    <section className="portalFeatureCard span12"><div><div className="eyebrow">STEP 1</div><h2>Get your free credit report</h2><p>Use an official consumer source directly. We never ask for your bureau passwords.</p></div><div className="portalSourceGrid">{preferred.map((p) => <a className="portalSourceCard" key={p.id} href={p.links.report || p.officialUrl} target="_blank" rel="noreferrer"><strong>{p.name}</strong><span>{p.notes}</span><b>Open official source →</b></a>)}</div></section>
    <section className="portalFeatureCard span6"><div className="eyebrow">STEP 2</div><h2>Authorize analysis</h2>{analysisConsent ? <div className="portalNotice success">✓ Your credit report analysis authorization is active.</div> : <><p>Authorization is required before we may analyze an uploaded report.</p><Link className="primaryButton" href="/portal/consents">Manage authorization</Link></>}</section>
    <section className="portalFeatureCard span6"><div className="eyebrow">STEP 3</div><h2>Upload securely</h2>{analysisConsent ? <PortalReportUploadForm providers={providers.map(({id,name}) => ({id,name}))} /> : <div className="portalNotice">Complete authorization first, then return here to upload.</div>}</section>
    <section className="portalFeatureCard span12"><div className="eyebrow">ADDITIONAL SOURCES</div><h2>Specialty consumer reports</h2><div className="portalSourceGrid compact">{other.map((p) => <a className="portalSourceCard" key={p.id} href={p.links.report || p.officialUrl} target="_blank" rel="noreferrer"><strong>{p.name}</strong><span>{p.notes}</span><b>Official source →</b></a>)}</div></section>
  </>;
  else if (section === 'consents') content = <><section className="portalFeatureCard span6"><div className="eyebrow">YOUR AUTHORIZATIONS</div><h2>Control what New850 may do</h2><p>Manage credit-analysis permissions separately from optional marketplace partner sharing.</p><PortalConsentForm /></section><section className="portalFeatureCard span6"><div className="eyebrow">HISTORY</div><h2>Recorded decisions</h2>{consents.length ? consents.map((c) => <div className="portalRecord" key={c.id}><div><strong>{c.scope.replaceAll('_',' ')}</strong><span>{new Date(c.grantedAt).toLocaleDateString()}</span></div><b className={c.granted ? 'recordGood' : 'recordBad'}>{c.granted ? 'Authorized' : 'Not authorized'}</b></div>) : <div className="portalNotice">No authorizations have been recorded yet.</div>}</section></>;
  else if (section === 'documents') content = <section className="portalFeatureCard span12">
    <div className="portalSectionHeading"><div><div className="eyebrow">YOUR SECURE FILE</div><h2>Documents & client-specific letters</h2><p>New850's master templates, prompts and internal methods are never exposed here. When a signature is required, you review only the exact final document prepared for your account.</p></div><div className="portalCount">{sharedDocuments.length}<span>items</span></div></div>
    {sharedDocuments.length ? <div className="portalDocumentGrid">{sharedDocuments.map((e) => {
      const metadata = documentMetadata(audit, e);
      const state = documentWorkflowState(audit, e.id);
      const signedCurrent = signatureMatchesCurrentVersion(audit, e);
      const isLetter = metadata.documentClass === 'client_document' && metadata.category === 'dispute';
      return <article className="portalDocumentCard" key={e.id} style={{ alignItems: 'stretch' }}>
        <div className="docIcon">{isLetter ? 'LTR' : 'DOC'}</div>
        <div><strong>{e.label}</strong><span>{metadata.category.replaceAll('_',' ')}</span><small>{metadata.filename || 'document'} · {new Date(e.createdAt).toLocaleDateString()}</small>{isLetter ? <small>Status: {clientDocumentStatusLabel(audit, e)}</small> : null}</div>
        {isLetter ? <>
          <a className="secondaryButton" href={`/api/documents/${encodeURIComponent(e.id)}/content`} target="_blank" rel="noreferrer">Review Exact Letter</a>
          {state === 'signature_required' ? <PortalDocumentSignatureForm id={e.id} defaultName={portal.client.displayName} /> : null}
          {state === 'signed' && signedCurrent ? <div className="portalNotice success">✓ Signed and authorized. New850 can now complete the approved sending workflow.</div> : null}
          {state === 'signed' && !signedCurrent ? <div className="portalNotice">This document changed after signature. A new signature is required before it may be sent.</div> : null}
          {state === 'sent' ? <div className="portalNotice success">✓ Sent by New850. You can monitor the next status here.</div> : null}
          {state === 'response_received' ? <div className="portalNotice success">✓ Response received. New850 is reviewing the result.</div> : null}
        </> : <a className="primaryButton" href={`/api/documents/${encodeURIComponent(e.id)}/content`} target="_blank" rel="noreferrer">View / Download</a>}
      </article>;
    })}</div> : <div className="portalNotice">No documents have been shared with you yet. New files and signature requests will appear here when New850 makes them available to your account.</div>}
    <div className="guardrail" style={{ marginTop: 16 }}>Your electronic signature applies only to the exact client-specific document version you review. New850 cannot use that signature for a materially changed version. Required consumer disclosures are handled separately from proprietary operational templates.</div>
  </section>;
  else if (section === 'progress') content = <><section className="portalFeatureCard span12"><div className="portalSectionHeading"><div><div className="eyebrow">CURRENT PLAN</div><h2>{intakeReady ? 'Your file is ready for review' : 'Complete your intake'}</h2><p>{intakeReady ? 'Your authorization and report are on file. Follow the timeline below for new readiness activity.' : 'Your next required step is shown below.'}</p></div><div className={`portalState ${intakeReady ? 'good' : 'waiting'}`}>{intakeReady ? 'On track' : 'Action needed'}</div></div><div className="portalTimelineSteps"><div className={analysisConsent ? 'timelineDone' : ''}><i>{analysisConsent ? '✓' : '1'}</i><strong>Authorization</strong><span>{analysisConsent ? 'Complete' : 'Required'}</span></div><div className={reports.length ? 'timelineDone' : ''}><i>{reports.length ? '✓' : '2'}</i><strong>Credit report</strong><span>{reports.length ? 'Received' : 'Required'}</span></div><div className={intakeReady ? 'timelineDone' : ''}><i>{intakeReady ? '✓' : '3'}</i><strong>Review readiness</strong><span>{intakeReady ? 'Ready' : 'Waiting'}</span></div></div></section><section className="portalFeatureCard span12"><div className="eyebrow">ACTIVITY</div><h2>Your readiness timeline</h2>{clientAudit.length ? clientAudit.map((a) => <div className="portalRecord" key={a.id}><div><strong>{a.action.replaceAll('_',' ')}</strong><span>{new Date(a.createdAt).toLocaleString()}</span></div><b>{a.decision === 'blocked' ? 'Pending review' : a.decision === 'approval_required' ? 'Approval step' : 'Recorded'}</b></div>) : <div className="portalNotice">Your timeline will populate as work progresses.</div>}</section></>;
  else if (section === 'account') content = <><section className="portalFeatureCard span6"><div className="eyebrow">PROFILE</div><h2>{portal.client.displayName}</h2><div className="portalProfileList"><div><span>Email</span><strong>{portal.email}</strong></div><div><span>State</span><strong>{portal.client.state}</strong></div><div><span>Account status</span><strong>{portal.client.status}</strong></div></div></section><section className="portalFeatureCard span6"><div className="eyebrow">SECURITY</div><h2>Your privacy matters</h2><p>Your login is bound to one client profile. Your account cannot access staff tools or another customer's records.</p><div className="portalNotice">Never share your credit bureau passwords with New850.com or anyone claiming to represent us.</div><Link className="secondaryButton" href="/portal/forgot-password">Reset portal password</Link></section></>;
  else content = <><section className="portalFeatureCard span12"><div className="eyebrow">SECURE INTAKE</div><h2>{intakeReady ? 'Your intake is complete' : 'Complete your secure intake'}</h2><p>Authorize analysis, obtain your report from an official source, then upload it to the private vault.</p><div className="portalTimelineSteps"><div className={analysisConsent ? 'timelineDone' : ''}><i>{analysisConsent ? '✓' : '1'}</i><strong>Authorization</strong><span>{analysisConsent ? 'Done' : 'Required'}</span></div><div className={reports.length ? 'timelineDone' : ''}><i>{reports.length ? '✓' : '2'}</i><strong>Credit report</strong><span>{reports.length ? 'Received' : 'Required'}</span></div><div className={intakeReady ? 'timelineDone' : ''}><i>{intakeReady ? '✓' : '3'}</i><strong>Ready</strong><span>{intakeReady ? 'Yes' : 'Not yet'}</span></div></div><Link className="primaryButton" href="/portal/reports">Continue intake</Link></section></>;

  return <main className="portalShell"><header className="portalHeader"><div><div className="portalBrand">NEW850.COM</div><div className="eyebrow portalPageEyebrow">{copy.eyebrow}</div><h1>{copy.title}</h1><p className="subtitle">{copy.subtitle}</p></div><PortalNav /></header><section className="grid">{content}</section></main>;
}
