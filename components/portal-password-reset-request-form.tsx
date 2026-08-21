'use client';

import { FormEvent, useState } from 'react';
import { authClient } from '@/lib/auth/client';

export function PortalPasswordResetRequestForm() {
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
      const redirectTo = `${window.location.origin}/portal/reset-password`;
      const result = await authClient.requestPasswordReset({ email, redirectTo });
      if (result.error) {
        setError(result.error.message || 'Unable to start portal password recovery.');
        return;
      }
      setMessage('If this New850 client portal has already been activated, a password reset link has been sent. If the portal has never been activated, use the secure activation link from New850 first.');
    } catch {
      setError('Unable to start portal password recovery.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="appForm" onSubmit={submit}>
      <label>
        Customer portal email
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
      </label>
      {error ? <div className="formError">{error}</div> : null}
      {message ? <div className="formSuccess">{message}</div> : null}
      <button className="primaryButton" disabled={busy} type="submit">
        {busy ? 'Sending reset link…' : 'Send customer reset link'}
      </button>
    </form>
  );
}
