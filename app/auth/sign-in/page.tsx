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
        <div className="kicker">CREDIT REPAIR MASTERS</div>
        <h1>Owner sign in</h1>
        <p className="subtitle">Secure access to tenant-scoped clients, consents, evidence, audit history and agent operations.</p>
        <SignInForm />
        <div className="guardrail">Only active organization members can access business data. Public sign-up is disabled.</div>
      </section>
    </main>
  );
}
