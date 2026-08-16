import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ConsentForm } from '@/components/consent-form';
import { EvidenceUploadForm } from '@/components/evidence-upload-form';
import { SignOutButton } from '@/components/sign-out-button';
import { getBusinessSession } from '@/lib/session-access';
import { getPlatformStore } from '@/lib/platform-store';

export const dynamic = 'force-dynamic';

export default async function ClientWorkspace({ params }: { params: Promise<{ id: string }> }) {
  const session = await getBusinessSession();
  if (!session) redirect('/auth/sign-in');
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

  return (
    <main>
      <header className="appHeader">
        <div><div className="kicker">CLIENT WORKSPACE / {client.id}</div><h1>{client.displayName}</h1><p className="subtitle">{client.kind} · {client.state} · {client.status}</p></div>
        <div className="headerActions"><Link className="secondaryButton" href="/clients">All clients</Link><Link className="secondaryButton" href="/dashboard">Dashboard</Link><SignOutButton /></div>
      </header>

      <section className="grid">
        <div className="card span3"><div className="label">Evidence</div><div className="value">{evidence.length}</div><div className="small">{evidence.filter((item) => item.verification === 'verified').length} verified</div></div>
        <div className="card span3"><div className="label">Consents</div><div className="value">{consents.length}</div><div className="small">{consents.filter((item) => item.granted).length} granted records</div></div>
        <div className="card span3"><div className="label">Client status</div><div className="value statusValue">{client.status}</div><div className="small">updated {new Date(client.updatedAt).toLocaleString()}</div></div>
        <div className="card span3"><div className="label">Live bureau data</div><div className="value">—</div><div className="small">provider not connected</div></div>

        <div className="card span6"><div className="label">Consent control</div><h2>Record authorization</h2><ConsentForm clientId={client.id} /></div>
        <div className="card span6"><div className="label">Evidence vault</div><h2>Upload private evidence</h2>{vaultConfigured ? <><EvidenceUploadForm clientId={client.id} /><div className="small" style={{ marginTop: 10 }}>Uploads remain unverified until a separate verification step is completed.</div></> : <div className="emptyState">Private evidence upload is disabled until the Vercel Blob credential is configured. Existing metadata remains visible, but no document bytes are stored insecurely.</div>}</div>

        <div className="card span6"><div className="label">Consent ledger</div><h2>Recorded consent</h2>
          {consents.length ? consents.map((item) => <div className="listRow" key={item.id}><div><strong>{item.scope.replaceAll('_', ' ')}</strong><div className="small">{item.source} · {new Date(item.grantedAt).toLocaleString()}</div></div><span className={`pill ${item.granted ? 'low' : 'high'}`}>{item.granted ? 'granted' : 'denied'}</span></div>) : <div className="emptyState">No consent records yet.</div>}
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
