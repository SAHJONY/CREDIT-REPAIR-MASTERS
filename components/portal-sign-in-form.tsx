'use client';

import { FormEvent, useState } from 'react';
import { authClient } from '@/lib/auth/client';

export function PortalSignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const result = await authClient.signIn.email({ email, password });
      if (result.error) {
        setError(result.error.message || 'Unable to sign in.');
        return;
      }
      window.location.assign('/portal');
    } catch {
      setError('Unable to sign in. Check your email and password.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="appForm" onSubmit={submit}>
      <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></label>
      <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required /></label>
      {error ? <div className="formError">{error}</div> : null}
      <button className="primaryButton" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in to my portal'}</button>
    </form>
  );
}
