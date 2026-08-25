import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ClientDisputeLetterForm } from '@/components/client-dispute-letter-form';
import { DocumentUploadForm } from '@/components/document-upload-form';
import { DocumentShareActions } from '@/components/document-share-actions';
import { DocumentWorkflowActions } from '@/components/document-workflow-actions';
import { SignOutButton } from '@/components/sign-out-button';
import { demoDocuments } from '@/lib/demo-documents';
import { documentMetadata, isDocumentShared, isManagedDocument } from '@/lib/document-sharing';
import { clientDocumentStatusLabel, documentWorkflowState, signatureMatchesCurrentVersion } from '@/lib/document-workflow';
import { getPlatformStore } from '@/lib/platform-store';
import { getBusinessSession } from '@/lib/session-access';

export const dynamic = 'force-dynamic';

export default async function DocumentsCenter() {
  const session = await getBusinessSession();
  if (!session) redirect('/auth/sign-in');
  if (session.mfaRequired && !session.mfaAssured) redirect('/auth/mfa');
  if (!['owner','admin','credit_specialist','compliance_reviewer','auditor'].includes(session.member.role)) redirect('/dashboard');

  const store = getPlatformStore();
  const [clients, audit] = await Promise.all([store.listClients(session.organizationId), store.listAudit(session.organizationId, 500)]);
  const documents = [] as Array<{ clientId: string; clientName: string; evidence: Awaited<ReturnType<typeof store.listEvidence>>[number] }>;
  for (const client of clients) {
    const evidence = await store.listEvidence(session.organizationId, client.id);
    for (const item of evidence) if (isManagedDocument(audit, item.id)) documents.push({ clientId: client.id, clientName: client.displayName, evidence: item });
  }

  return <main>
    <header className="appHeader"><div><div className="kicker">NEW850.COM / DOCUMENTS</div><h1>Document & Letter Control Center</h1><p className="subtitle">Private customer files, client-specific letters, electronic signatures, version locks and auditable New850 sending controls.</p></div><div className="headerActions"><Link className="secondaryButton" href="/dashboard">Dashboard</Link><Link className="secondaryButton" href="/demo/documents">Document examples</Link><SignOutButton /></div></header>
    <section className="grid">
      <div className="card span5"><div className="label">UPLOAD</div><h2>Add a customer document</h2><p className="small">Files stay private in the Evidence Vault. Ordinary documents may be shared; client letters follow the signature workflow before New850 sends them.</p>{session.member.role === 'auditor' ? <div className="emptyState">Auditors have read-only access.</div> : <DocumentUploadForm clients={clients.map((client) => ({ id: client.id, name: client.displayName }))} />}</div>
      <div className="card span7"><div className="label">PROPRIETARY WORKFLOW</div><h2>Master templates never enter the client portal</h2><p className="small">Clients review only their final client-specific letter. The system binds their electronic signature to that document's SHA-256 version. If the file changes, a new signature is required.</p><div className="guardrail">New850's master templates, prompts, internal notes and generation logic remain Owner OS only. Required consumer disclosures remain separately deliverable when applicable.</div></div>

      <div className="card span12">
        <div className="label">CLIENT-VOICE DISPUTE DRAFTING</div>
        <h2>Write from the client's actual facts—not from a mass template</h2>
        <p className="small">The drafting engine uses plain first-person language, specific account facts, actual supporting documents and the requested correction. Full client and recipient postal addresses stay local to the application rather than being sent to the model. Every draft remains review- and approval-gated.</p>
        {session.member.role === 'auditor' ? <div className="emptyState">Auditors have read-only access to drafting controls.</div> : clients.length ? <ClientDisputeLetterForm clients={clients.map((client) => ({ id: client.id, name: client.displayName }))} /> : <div className="emptyState">Create a client record before drafting client correspondence.</div>}
      </div>

      <div className="card span12"><div className="label">CLIENT DOCUMENTS</div><h2>Private document ledger</h2>{documents.length ? documents.map(({ clientId, clientName, evidence }) => {
        const metadata = documentMetadata(audit, evidence);
        const shared = isDocumentShared(audit, evidence.id);
        const workflowState = documentWorkflowState(audit, evidence.id);
        const versionSigned = signatureMatchesCurrentVersion(audit, evidence);
        const isLetter = metadata.documentClass === 'client_document' && metadata.category === 'dispute';
        return <div className="listRow" key={evidence.id} style={{ alignItems: 'flex-start' }}>
          <div>
            <strong>{evidence.label}</strong>
            <div className="small">{clientName} · {metadata.category.replaceAll('_',' ')} · {metadata.filename || 'private file'} · {new Date(evidence.createdAt).toLocaleString()}</div>
            <div className="small">Class: {metadata.documentClass.replaceAll('_',' ').toUpperCase()} · Verification: {evidence.verification} · Version lock: {evidence.sha256 ? `${evidence.sha256.slice(0, 12)}…` : 'missing'}</div>
            {isLetter ? <div className="small" style={{ marginTop: 5 }}>Letter workflow: <strong>{clientDocumentStatusLabel(audit, evidence)}</strong></div> : null}
          </div>
          <div style={{ display: 'grid', gap: 8, justifyItems: 'end' }}>
            <span className={`pill ${isLetter ? workflowState === 'sent' || workflowState === 'response_received' ? 'low' : workflowState === 'signature_required' ? 'medium' : versionSigned ? 'low' : 'medium' : shared ? 'low' : 'medium'}`}>{isLetter ? workflowState.replaceAll('_',' ').toUpperCase() : shared ? 'SHARED' : 'INTERNAL'}</span>
            {session.member.role === 'auditor' ? <a className="secondaryButton" href={`/api/documents/${encodeURIComponent(evidence.id)}/content`} target="_blank" rel="noreferrer">View</a> : isLetter ? <><a className="secondaryButton" href={`/api/documents/${encodeURIComponent(evidence.id)}/content`} target="_blank" rel="noreferrer">Review Final</a><DocumentWorkflowActions id={evidence.id} clientId={clientId} state={workflowState} versionSigned={versionSigned} /></> : <DocumentShareActions id={evidence.id} clientId={clientId} shared={shared} />}
          </div>
        </div>;
      }) : <div className="emptyState">No managed customer documents uploaded yet.</div>}</div>
    </section>
  </main>;
}
