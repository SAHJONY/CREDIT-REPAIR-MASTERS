import Link from 'next/link';
import { PasswordResetRequestForm } from '@/components/password-reset-request-form';

export const dynamic = 'force-dynamic';

export default function ForgotPasswordPage() {
  return (
    <main className="authShell">
      <section className="authCard">
        <div className="kicker">NEW850.COM</div>
        <h1>Recover owner access</h1>
        <p className="subtitle">Send a secure password-reset link to the approved New850 owner email.</p>
        <PasswordResetRequestForm />
        <div style={{ marginTop: 16 }}>
          <Link className="secondaryButton" href="/auth/sign-in">Back to sign in</Link>
        </div>
      </section>
    </main>
  );
}
