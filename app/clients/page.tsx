import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ClientCreateForm } from '@/components/client-create-form';
import { SignOutButton } from '@/components/sign-out-button';
import { getBusinessSession } from '@/lib/session-access';
import { getPlatformStore } from '@/lib/platform-store';

export const dynamic = 'force-dynamic';

export default async function ClientsPage() {
  const session = await getBusinessSession();
  if (!session) redirect('/auth/sign-in');
  if (session.mfaRequired && !session.mfaAssured) redirect('/auth/mfa');
  const clients = await getPlatformStore().listClients(session.organizationId);

  return (
    <main>
      <header className="appHeader">
        <div><div className="kicker">CREDIT REPAIR MASTERS / CLIENT MANAGEMENT</div><h1>Clients</h1><p className="subtitle">Create and manage real tenant-scoped consumer and business credit clients.</p></div>
        <div className="headerActions"><Link className="secondaryButton" href="/dashboard">Dashboard</Link><SignOutButton /></div>
      </header>
      <section className="grid">
        <div className="card span4"><div className="label">New client</div><h2>Onboard a client</h2><ClientCreateForm /></div>
        <div className="card span8"><div className="label">Client directory</div><h2>{clients.length} real record{clients.length === 1 ? '' : 's'}</h2>
          {clients.length ? clients.map((client) => <Link className="listRow" href={`/clients/${client.id}`} key={client.id}><div><strong>{client.displayName}</strong><div className="small">{client.kind} · {client.state} · updated {new Date(client.updatedAt).toLocaleDateString()}</div></div><span className="pill low">{client.status}</span></Link>) : <div className="emptyState">No clients exist yet.</div>}
        </div>
      </section>
    </main>
  );
}
