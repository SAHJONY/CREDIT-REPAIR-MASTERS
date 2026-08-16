'use client';

import { FormEvent, useState } from 'react';
import { authClient } from '@/lib/auth/client';

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

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
      window.location.assign('/dashboard');
    } catch {
      setError('Authentication service unavailable.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="appForm" onSubmit={submit}>
      <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></label>
      <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required /></label>
      {error ? <div className="formError">{error}</div> : null}
      <button className="primaryButton" disabled={busy} type="submit">{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
  );
}
