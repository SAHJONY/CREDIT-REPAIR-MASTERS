import Link from 'next/link';
import { PortalPasswordResetForm } from '@/components/portal-password-reset-form';

export const dynamic = 'force-dynamic';

export default function PortalResetPasswordPage() {
  return (
    <main className="authShell">
      <section className="authCard">
        <div className="kicker">NEW850.COM / CLIENT PORTAL</div>
        <h1>Set new portal password</h1>
        <p className="subtitle">Complete the secure New850 client portal recovery flow.</p>
        <PortalPasswordResetForm />
        <div style={{ marginTop: 16 }}>
          <Link className="secondaryButton" href="/portal/forgot-password">Request a new customer reset link</Link>
        </div>
      </section>
    </main>
  );
}
