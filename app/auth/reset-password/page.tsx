import Link from 'next/link';
import { PasswordResetForm } from '@/components/password-reset-form';

export const dynamic = 'force-dynamic';

export default function ResetPasswordPage() {
  return (
    <main className="authShell">
      <section className="authCard">
        <div className="kicker">CREDIT REPAIR MASTERS</div>
        <h1>Set new owner password</h1>
        <p className="subtitle">Complete the secure Neon Auth recovery flow with the reset link sent to the approved owner email.</p>
        <PasswordResetForm />
        <div style={{ marginTop: 16 }}>
          <Link className="secondaryButton" href="/auth/forgot-password">Request a new reset link</Link>
        </div>
      </section>
    </main>
  );
}
