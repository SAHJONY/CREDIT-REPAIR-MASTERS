import Link from 'next/link';
import { ClientPortalActivationForm } from '@/components/client-portal-activation-form';

export const dynamic = 'force-dynamic';

export default async function ClientPortalActivatePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = '' } = await searchParams;

  return (
    <main className="authShell">
      <section className="authCard">
        <div className="kicker">CREDIT REPAIR MASTERS / CLIENT PORTAL</div>
        <h1>Activate your secure portal</h1>
        <p className="subtitle">Use the email address your account manager invited. Your activation link is client-specific and time-limited.</p>
        {token ? <ClientPortalActivationForm token={token} /> : <div className="formError">This activation link is incomplete. Request a new invitation from CREDIT REPAIR MASTERS.</div>}
        <div className="authActions"><Link className="secondaryButton" href="/portal/sign-in">Already activated? Sign in</Link></div>
        <div className="guardrail">Never share bureau passwords. Portal access is limited to your own client profile and records.</div>
      </section>
    </main>
  );
}
