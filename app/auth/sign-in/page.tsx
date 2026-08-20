import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SignInForm } from '@/components/sign-in-form';
import { getBusinessSession } from '@/lib/session-access';

export const dynamic = 'force-dynamic';

export default async function SignInPage() {
  const session = await getBusinessSession();
  if (session) redirect('/dashboard');

  return (
    <main className="authShell">
      <section className="authCard">
        <div className="kicker">NEW850.COM</div>
        <h1>Owner sign in</h1>
        <p className="subtitle">Secure access to tenant-scoped clients, consents, evidence, audit history and agent operations.</p>
        <SignInForm />
        <div className="authActions">
          <Link className="secondaryButton" href="/auth/forgot-password">Forgot or missing password?</Link>
          <Link className="secondaryButton" href="/auth/activate">First time? Activate approved owner access</Link>
        </div>
        <div className="guardrail">Only active organization members can access business data. Public business access is disabled.</div>
      </section>
    </main>
  );
}
