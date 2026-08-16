import Link from 'next/link';
import { redirect } from 'next/navigation';
import { MfaForm } from '@/components/mfa-form';
import { SignOutButton } from '@/components/sign-out-button';
import { getBusinessSession } from '@/lib/session-access';

export const dynamic = 'force-dynamic';

export default async function MfaPage() {
  const session = await getBusinessSession();
  if (!session) redirect('/auth/sign-in');
  if (!session.mfaRequired) redirect('/dashboard');
  if (session.mfaAssured) redirect('/dashboard');

  return (
    <main>
      <header className="appHeader">
        <div>
          <div className="kicker">CREDIT REPAIR MASTERS / PRIVILEGED ACCESS</div>
          <h1>Multi-factor authentication</h1>
          <p className="subtitle">Owner and admin access requires a second factor before privileged operations are available.</p>
        </div>
        <div className="headerActions"><Link className="secondaryButton" href="/auth/sign-in">Sign in</Link><SignOutButton /></div>
      </header>
      <section className="grid">
        <div className="card span8">
          <div className="label">Security gate</div>
          <h2>{session.email}</h2>
          <MfaForm />
        </div>
        <div className="card span4">
          <div className="label">Controls</div>
          <h2>Privileged-session policy</h2>
          <p className="small">MFA assurance expires automatically. Recovery codes are one-time use. Repeated invalid attempts trigger a temporary lockout.</p>
        </div>
      </section>
    </main>
  );
}
