import Link from 'next/link';
import { PortalSignInForm } from '@/components/portal-sign-in-form';

export default function PortalSignInPage() {
  return (
    <main className="authShell">
      <section className="authCard">
        <div className="kicker">NEW850.COM / CLIENT PORTAL</div>
        <h1>Welcome back</h1>
        <p className="subtitle">Securely access your credit-report intake, documents, authorizations, and progress.</p>
        <PortalSignInForm />
        <div className="authActions">
          <Link className="secondaryButton" href="/portal/forgot-password">Forgot password?</Link>
          <Link className="secondaryButton" href="/">Back to website</Link>
        </div>
        <div className="guardrail">Your portal is private. If you have never activated your portal, password recovery will not work yet; use the secure activation link issued for your client profile first.</div>
      </section>
    </main>
  );
}
