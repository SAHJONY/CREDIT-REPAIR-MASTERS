'use client';

import { FormEvent, useState } from 'react';

export function ClientPortalInviteForm({ clientId }: { clientId: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [inviteUrl, setInviteUrl] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setInviteUrl('');
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch(`/api/clients/${clientId}/portal-invite`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: form.get('email') })
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error || 'Unable to create portal invitation.');
        return;
      }
      setInviteUrl(payload.inviteUrl);
    } catch {
      setError('Unable to create portal invitation.');
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(inviteUrl);
  }

  return (
    <form className="appForm" onSubmit={submit}>
      <label>Customer email<input name="email" type="email" autoComplete="email" required /></label>
      {error ? <div className="formError">{error}</div> : null}
      {inviteUrl ? <div className="guardrail"><strong>Secure activation link created.</strong><div className="small" style={{ marginTop: 8, overflowWrap: 'anywhere' }}>{inviteUrl}</div><button className="secondaryButton" type="button" onClick={copy} style={{ marginTop: 10 }}>Copy activation link</button></div> : null}
      <button className="primaryButton" disabled={busy} type="submit">{busy ? 'Creating invite…' : 'Invite to Portal'}</button>
      <div className="small">The activation link expires after 72 hours and is bound to this client and email address.</div>
    </form>
  );
}
