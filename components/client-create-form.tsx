'use client';

import { FormEvent, useState } from 'react';

export function ClientCreateForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          displayName: form.get('displayName'),
          kind: form.get('kind'),
          state: form.get('state'),
          status: 'onboarding'
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error || 'Unable to create client.');
        return;
      }
      window.location.assign(`/clients/${payload.client.id}`);
    } catch {
      setError('Client service unavailable.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="appForm compactForm" onSubmit={submit}>
      <label>Client name<input name="displayName" minLength={2} maxLength={120} required /></label>
      <div className="formGrid">
        <label>Type<select name="kind" defaultValue="consumer"><option value="consumer">Consumer</option><option value="business">Business</option></select></label>
        <label>State<input name="state" minLength={2} maxLength={2} placeholder="FL" required /></label>
      </div>
      {error ? <div className="formError">{error}</div> : null}
      <button className="primaryButton" disabled={busy} type="submit">{busy ? 'Creating…' : 'Create client'}</button>
    </form>
  );
}
