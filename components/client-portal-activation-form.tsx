'use client';

import { FormEvent, useState } from 'react';

export function ClientPortalActivationForm({ token }: { token: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setDone(false);
    const form = new FormData(event.currentTarget);
    const password = String(form.get('password') || '');
    const confirm = String(form.get('confirm') || '');
    if (password !== confirm) {
      setError('Passwords do not match.');
      setBusy(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/activate-client', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, email: form.get('email'), password })
      });
      const payload = await response.json();
      if (!response.ok) {
        if (payload.signInUrl) {
          window.location.assign(payload.signInUrl);
          return;
        }
        setError(payload.error || 'Unable to activate portal account.');
        return;
      }
      setDone(true);
      setTimeout(() => window.location.assign('/portal/sign-in'), 800);
    } catch {
      setError('Authentication service unavailable.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="appForm" onSubmit={submit}>
      <label>Invited email<input name="email" type="email" autoComplete="email" required /></label>
      <label>Create password<input name="password" type="password" minLength={12} autoComplete="new-password" required /></label>
      <label>Confirm password<input name="confirm" type="password" minLength={12} autoComplete="new-password" required /></label>
      {error ? <div className="formError">{error}</div> : null}
      {done ? <div className="guardrail">Your secure portal account is active. Redirecting to sign in…</div> : null}
      <button className="primaryButton" disabled={busy || !token} type="submit">{busy ? 'Activating…' : 'Activate my portal'}</button>
    </form>
  );
}
