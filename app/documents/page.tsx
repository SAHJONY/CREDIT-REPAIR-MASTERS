import Link from 'next/link';
import { redirect } from 'next/navigation';
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
    <header className="appHeader"><div><div className="kicker">CREDIT REPAIR MASTERS / DOCUMENTS</div><h1>Document Management & Sharing</h1><p className="subtitle">Private customer files, template examples, sharing controls, and an auditable customer-delivery workflow.</p></div><div className="headerActions"><Link className="secondaryButton" href="/dashboard">Dashboard</Link><Link className="secondaryButton" href="/demo/documents">33 examples</Link><SignOutButton /></div></header>
    <section className="grid">
      <div className="card span5"><div className="label">UPLOAD</div><h2>Add a customer document</h2><p className="small">Files stay private in the Evidence Vault. Share immediately or keep internal until review.</p>{session.member.role === 'auditor' ? <div className="emptyState">Auditors have read-only access.</div> : <DocumentUploadForm clients={clients.map((client) => ({ id: client.id, name: client.displayName }))} />}</div>
      <div className="card span7"><div className="label">TEMPLATE LIBRARY</div><h2>{demoDocuments.length} document examples</h2><p className="small">SAMPLE documents remain separate from real client records.</p><div className="row"><div><strong>Browse agreements, disputes, billing, compliance and business-credit examples.</strong></div><Link className="primaryButton" href="/demo/documents">Open all examples</Link></div></div>
      <div className="card span12"><div className="label">CLIENT DOCUMENTS</div><h2>Private document ledger</h2>{documents.length ? documents.map(({ clientId, clientName, evidence }) => { const metadata = documentMetadata(audit, evidence); const shared = isDocumentShared(audit, evidence.id); return <div className="listRow" key={evidence.id}><div><strong>{evidence.label}</strong><div className="small">{clientName} · {metadata.category.replaceAll('_',' ')} · {metadata.filename || 'private file'} · {new Date(evidence.createdAt).toLocaleString()}</div><div className="small">Class: CLIENT DOCUMENT · Verification: {evidence.verification}</div></div><div><span className={`pill ${shared ? 'low' : 'medium'}`}>{shared ? 'SHARED' : 'INTERNAL'}</span>{session.member.role === 'auditor' ? <a className="secondaryButton" href={`/api/documents/${encodeURIComponent(evidence.id)}/content`} target="_blank" rel="noreferrer">View</a> : <DocumentShareActions id={evidence.id} clientId={clientId} shared={shared} />}</div></div>; }) : <div className="emptyState">No managed customer documents uploaded yet.</div>}</div>
    </section>
  </main>;
}