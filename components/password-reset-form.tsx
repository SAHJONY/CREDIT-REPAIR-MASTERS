'use client';

import { FormEvent, useMemo, useState } from 'react';
import { authClient } from '@/lib/auth/client';

export function PasswordResetForm() {
  const token = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('token') || '';
  }, []);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [complete, setComplete] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!token) {
      setError('Password reset token is missing or invalid. Request a new reset link.');
      return;
    }
    if (password.length < 12) {
      setError('Password must be at least 12 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setBusy(true);
    try {
      const result = await authClient.resetPassword({ newPassword: password, token });
      if (result.error) {
        setError(result.error.message || 'Unable to reset password.');
        return;
      }
      setComplete(true);
    } catch {
      setError('Unable to reset password. Request a new reset link and try again.');
    } finally {
      setBusy(false);
    }
  }

  if (complete) {
    return (
      <div className="appForm">
        <div className="formSuccess">Password updated. You can now sign in with your new password.</div>
        <a className="primaryButton" href="/auth/sign-in">Return to owner sign in</a>
      </div>
    );
  }

  return (
    <form className="appForm" onSubmit={submit}>
      <label>
        New password
        <input type="password" minLength={12} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" required />
      </label>
      <label>
        Confirm new password
        <input type="password" minLength={12} value={confirm} onChange={(event) => setConfirm(event.target.value)} autoComplete="new-password" required />
      </label>
      {error ? <div className="formError">{error}</div> : null}
      <button className="primaryButton" disabled={busy} type="submit">
        {busy ? 'Updating password…' : 'Set new password'}
      </button>
    </form>
  );
}
