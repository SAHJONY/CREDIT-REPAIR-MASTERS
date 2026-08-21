import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ClientPortalInviteForm } from '@/components/client-portal-invite-form';
import { SignOutButton } from '@/components/sign-out-button';
import { getBusinessSession } from '@/lib/session-access';
import { getPlatformStore } from '@/lib/platform-store';

export const dynamic = 'force-dynamic';

export default async function PortalAccessPage() {
  const session = await getBusinessSession();
  if (!session) redirect('/auth/sign-in');
  if (session.mfaRequired && !session.mfaAssured) redirect('/auth/mfa');
  if (!['owner', 'admin', 'credit_specialist'].includes(session.member.role)) redirect('/clients');

  const clients = await getPlatformStore().listClients(session.organizationId);
  const eligible = clients.filter((client) => client.status !== 'closed');

  return (
    <main>
      <header className="appHeader">
        <div><div className="kicker">NEW850.COM / CUSTOMER PORTAL</div><h1>Portal Access</h1><p className="subtitle">Provision secure customer access without exposing internal staff tools.</p></div>
        <div className="headerActions"><Link className="secondaryButton" href="/clients">Clients</Link><Link className="secondaryButton" href="/dashboard">Dashboard</Link><SignOutButton /></div>
      </header>
      <section className="grid">
        <div className="card span12"><div className="label">Provisioning workflow</div><h2>Invite → Activate → Sign in</h2><div className="guardrail">Generate a customer-specific activation link, deliver it to the verified customer email, and have the customer create their own password. The customer account is then bound to exactly one tenant-scoped client profile.</div></div>
        {eligible.length ? eligible.map((client) => (
          <div className="card span6" key={client.id}>
            <div className="label">{client.state} · {client.status}</div>
            <h2>{client.displayName}</h2>
            <div className="small" style={{ marginBottom: 14 }}>Client ID: {client.id}</div>
            <ClientPortalInviteForm clientId={client.id} />
          </div>
        )) : <div className="card span12"><div className="emptyState">No eligible clients are available for portal provisioning.</div></div>}
      </section>
    </main>
  );
}
