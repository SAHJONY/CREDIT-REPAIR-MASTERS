'use client';

import { FormEvent, useState } from 'react';

const scopes = [
  ['credit_report_analysis', 'Credit report analysis'],
  ['dispute_drafting', 'Dispute letter drafting'],
  ['dispute_submission', 'Dispute submission approval']
] as const;

export function PortalConsentForm() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/portal/consents', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ scope: form.get('scope'), granted: form.get('granted') === 'true' })
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error || 'Unable to update consent.');
        return;
      }
      setMessage('Your authorization was recorded successfully.');
      window.setTimeout(() => window.location.reload(), 600);
    } catch {
      setError('Consent service unavailable.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="appForm compactForm" onSubmit={submit}>
      <label>Authorization<select name="scope" defaultValue="credit_report_analysis">{scopes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label>Decision<select name="granted" defaultValue="true"><option value="true">Grant authorization</option><option value="false">Revoke / deny</option></select></label>
      {message ? <div className="formSuccess">{message}</div> : null}
      {error ? <div className="formError">{error}</div> : null}
      <button className="primaryButton" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save authorization'}</button>
    </form>
  );
}
