'use client';

import { FormEvent, useState } from 'react';
import { authClient } from '@/lib/auth/client';

export function PasswordResetRequestForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');

    try {
      const redirectTo = `${window.location.origin}/auth/reset-password`;
      const result = await authClient.requestPasswordReset({ email, redirectTo });

      if (result.error) {
        setError(result.error.message || 'Unable to start password recovery.');
        return;
      }

      setMessage('If that email is eligible for recovery, a password reset link has been sent.');
    } catch {
      setError('Unable to start password recovery.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="appForm" onSubmit={submit}>
      <label>
        Owner email
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
      </label>
      {error ? <div className="formError">{error}</div> : null}
      {message ? <div className="formSuccess">{message}</div> : null}
      <button className="primaryButton" disabled={busy} type="submit">
        {busy ? 'Sending reset link…' : 'Send reset link'}
      </button>
    </form>
  );
}
