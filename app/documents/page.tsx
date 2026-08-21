import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ClientDisputeLetterForm } from '@/components/client-dispute-letter-form';
import { DocumentUploadForm } from '@/components/document-upload-form';
import { DocumentShareActions } from '@/components/document-share-actions';
import { SignOutButton } from '@/components/sign-out-button';
import { demoDocuments } from '@/lib/demo-documents';
import { documentMetadata, isDocumentShared, isManagedDocument } from '@/lib/document-sharing';
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
    <header className="appHeader"><div><div className="kicker">NEW850.COM / DOCUMENTS</div><h1>Document Management & Sharing</h1><p className="subtitle">Private customer files, client-voice dispute drafting, sharing controls, and an auditable customer-delivery workflow.</p></div><div className="headerActions"><Link className="secondaryButton" href="/dashboard">Dashboard</Link><Link className="secondaryButton" href="/demo/documents">Document examples</Link><SignOutButton /></div></header>
    <section className="grid">
      <div className="card span5"><div className="label">UPLOAD</div><h2>Add a customer document</h2><p className="small">Files stay private in the Evidence Vault. Share immediately or keep internal until review.</p>{session.member.role === 'auditor' ? <div className="emptyState">Auditors have read-only access.</div> : <DocumentUploadForm clients={clients.map((client) => ({ id: client.id, name: client.displayName }))} />}</div>
      <div className="card span7"><div className="label">TEMPLATE LIBRARY</div><h2>{demoDocuments.length} document examples</h2><p className="small">SAMPLE documents remain separate from real client records. Real dispute drafts should use the client-voice workflow below.</p><div className="row"><div><strong>Browse agreements, compliance and reference examples.</strong></div><Link className="secondaryButton" href="/demo/documents">Open examples</Link></div></div>

      <div className="card span12">
        <div className="label">CLIENT-VOICE DISPUTE DRAFTING</div>
        <h2>Write from the client's actual facts—not from a mass template</h2>
        <p className="small">The drafting engine uses plain first-person language, specific account facts, actual supporting documents and the requested correction. Full client and recipient postal addresses stay local to the application rather than being sent to the model. Every draft remains review- and approval-gated.</p>
        {session.member.role === 'auditor' ? <div className="emptyState">Auditors have read-only access to drafting controls.</div> : clients.length ? <ClientDisputeLetterForm clients={clients.map((client) => ({ id: client.id, name: client.displayName }))} /> : <div className="emptyState">Create a client record before drafting client correspondence.</div>}
      </div>

      <div className="card span12"><div className="label">CLIENT DOCUMENTS</div><h2>Private document ledger</h2>{documents.length ? documents.map(({ clientId, clientName, evidence }) => { const metadata = documentMetadata(audit, evidence); const shared = isDocumentShared(audit, evidence.id); return <div className="listRow" key={evidence.id}><div><strong>{evidence.label}</strong><div className="small">{clientName} · {metadata.category.replaceAll('_',' ')} · {metadata.filename || 'private file'} · {new Date(evidence.createdAt).toLocaleString()}</div><div className="small">Class: CLIENT DOCUMENT · Verification: {evidence.verification}</div></div><div><span className={`pill ${shared ? 'low' : 'medium'}`}>{shared ? 'SHARED' : 'INTERNAL'}</span>{session.member.role === 'auditor' ? <a className="secondaryButton" href={`/api/documents/${encodeURIComponent(evidence.id)}/content`} target="_blank" rel="noreferrer">View</a> : <DocumentShareActions id={evidence.id} clientId={clientId} shared={shared} />}</div></div>; }) : <div className="emptyState">No managed customer documents uploaded yet.</div>}</div>
    </section>
  </main>;
}
