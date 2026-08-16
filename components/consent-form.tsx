'use client';

import { FormEvent, useState } from 'react';

const scopes = [
  ['credit_report_analysis', 'Credit report analysis'],
  ['dispute_drafting', 'Dispute drafting'],
  ['dispute_submission', 'Dispute submission'],
  ['financial_action', 'Financial action'],
  ['new_credit', 'New credit'],
  ['identity_theft_workflow', 'Identity theft workflow']
] as const;

export function ConsentForm({ clientId }: { clientId: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/consents', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          clientId,
          scope: form.get('scope'),
          granted: form.get('granted') === 'true',
          source: 'staff_recorded'
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error || 'Unable to record consent.');
        return;
      }
      window.location.reload();
    } catch {
      setError('Consent service unavailable.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="appForm compactForm" onSubmit={submit}>
      <label>Scope<select name="scope" defaultValue="credit_report_analysis">{scopes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label>Decision<select name="granted" defaultValue="true"><option value="true">Granted</option><option value="false">Denied / revoked</option></select></label>
      <div className="small">This records a staff attestation that client authorization was documented. It is stored as <strong>staff_recorded</strong> and is not represented as client-originated portal consent.</div>
      {error ? <div className="formError">{error}</div> : null}
      <button className="primaryButton" disabled={busy} type="submit">{busy ? 'Recording…' : 'Record documented consent'}</button>
    </form>
  );
}
