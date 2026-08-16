import Link from 'next/link';
import { redirect } from 'next/navigation';
import { OwnerActivationForm } from '@/components/owner-activation-form';
import { getBusinessSession } from '@/lib/session-access';

export const dynamic = 'force-dynamic';

export default async function ActivateOwnerPage() {
  const session = await getBusinessSession();
  if (session) redirect('/dashboard');

  return (
    <main className="authShell">
      <section className="authCard">
        <div className="kicker">CREDIT REPAIR MASTERS</div>
        <h1>Activate owner access</h1>
        <p className="subtitle">First-time credential setup is restricted to active owner emails already approved in the production organization.</p>
        <OwnerActivationForm />
        <div style={{ marginTop: 16 }}><Link className="secondaryButton" href="/auth/sign-in">Back to sign in</Link></div>
      </section>
    </main>
  );
}
