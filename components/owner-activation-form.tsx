'use client';

import { FormEvent, useState } from 'react';

export function OwnerActivationForm() {
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
      const response = await fetch('/api/auth/activate-owner', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: form.get('email'), password, activationCode: form.get('activationCode') })
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error || 'Unable to activate owner account.');
        return;
      }
      setDone(true);
      setTimeout(() => window.location.assign('/auth/sign-in'), 700);
    } catch {
      setError('Authentication service unavailable.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="appForm" onSubmit={submit}>
      <label>Authorized owner email<input name="email" type="email" autoComplete="email" required /></label>
      <label>One-time activation code<input name="activationCode" type="password" minLength={16} autoComplete="one-time-code" required /></label>
      <label>Create password<input name="password" type="password" minLength={12} autoComplete="new-password" required /></label>
      <label>Confirm password<input name="confirm" type="password" minLength={12} autoComplete="new-password" required /></label>
      {error ? <div className="formError">{error}</div> : null}
      {done ? <div className="guardrail">Owner account activated. Redirecting to sign in…</div> : null}
      <button className="primaryButton" disabled={busy} type="submit">{busy ? 'Activating…' : 'Activate owner account'}</button>
    </form>
  );
}
