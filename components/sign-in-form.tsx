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
        setError(result.error.message || 'Unable to sign in. Use password recovery if this owner account has no working password yet.');
        return;
      }
      window.location.assign('/dashboard');
    } catch {
      setError('Unable to sign in. Check the credentials or use password recovery below.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="appForm" onSubmit={submit}>
      <label>Work email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@company.com" required /></label>
      <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" placeholder="Enter your password" required /></label>
      {error ? <div className="formError" role="alert">{error}</div> : null}
      <button className="primaryButton authSubmit" disabled={busy} type="submit"><span>{busy ? 'Signing in…' : 'Sign in securely'}</span><span aria-hidden="true">→</span></button>
    </form>
  );
}
