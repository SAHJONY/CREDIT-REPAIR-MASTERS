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
        <div>
          <div className="kicker">NEW850.COM / OWNER OS / CLIENT MANAGEMENT</div>
          <h1>Clients</h1>
          <p className="subtitle">Onboard qualified prospects, manage client records and continue each customer into readiness, documents, billing and marketplace workflows.</p>
        </div>
        <div className="headerActions">
          <Link className="primaryButton" href="/owner">Owner OS</Link>
          <Link className="secondaryButton" href="/growth/leads">Lead Inbox</Link>
          <Link className="secondaryButton" href="/clients/portal-access">Portal Access</Link>
          <Link className="secondaryButton" href="/owner/readiness">Readiness</Link>
          <SignOutButton />
        </div>
      </header>
      <section className="grid">
        <div className="card span4">
          <div className="label">ONBOARD</div>
          <h2>Create a client</h2>
          <p className="small">Create a managed client only after the lead has been reviewed and the service relationship is appropriate.</p>
          <ClientCreateForm />
        </div>
        <div className="card span8">
          <div className="row">
            <div><div className="label">CLIENT DIRECTORY</div><h2>{clients.length} real record{clients.length === 1 ? '' : 's'}</h2></div>
            <Link className="secondaryButton" href="/documents">Letters & documents</Link>
          </div>
          {clients.length ? clients.map((client) => (
            <Link className="listRow" href={`/clients/${client.id}`} key={client.id}>
              <div><strong>{client.displayName}</strong><div className="small">{client.kind} · {client.state} · updated {new Date(client.updatedAt).toLocaleDateString()}</div></div>
              <span className="pill low">{client.status}</span>
            </Link>
          )) : <div className="emptyState">No clients exist yet. Review the Lead Inbox first, then onboard qualified prospects here.</div>}
        </div>
      </section>
    </main>
  );
}
