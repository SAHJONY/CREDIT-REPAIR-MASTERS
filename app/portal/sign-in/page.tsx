import Link from 'next/link';
import { PortalSignInForm } from '@/components/portal-sign-in-form';

export default function PortalSignInPage() {
  return (
    <main className="authShell">
      <section className="authCard">
        <div className="kicker">CREDIT REPAIR MASTERS / CLIENT PORTAL</div>
        <h1>Welcome back</h1>
        <p className="subtitle">Securely access your credit-report intake, documents, authorizations, and progress.</p>
        <PortalSignInForm />
        <div className="authActions">
          <Link className="secondaryButton" href="/auth/forgot-password">Forgot password?</Link>
          <Link className="secondaryButton" href="/">Back to website</Link>
        </div>
        <div className="guardrail">Your portal is private. CREDIT REPAIR MASTERS will never ask you to share bureau passwords or bypass identity verification.</div>
      </section>
    </main>
  );
}
