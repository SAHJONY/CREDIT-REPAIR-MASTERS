import Link from 'next/link';
import { PortalPasswordResetRequestForm } from '@/components/portal-password-reset-request-form';

export const dynamic = 'force-dynamic';

export default function PortalForgotPasswordPage() {
  return (
    <main className="authShell">
      <section className="authCard">
        <div className="kicker">NEW850.COM / CLIENT PORTAL</div>
        <h1>Recover customer portal access</h1>
        <p className="subtitle">Reset the password for an already-activated New850 client portal account.</p>
        <PortalPasswordResetRequestForm />
        <div style={{ marginTop: 16 }}>
          <Link className="secondaryButton" href="/portal/sign-in">Back to customer sign in</Link>
        </div>
        <div className="guardrail">New customer portals must be activated before password recovery can work. Activation creates the portal identity and binds it to exactly one client profile.</div>
      </section>
    </main>
  );
}
