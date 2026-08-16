'use client';

import { FormEvent, useState } from 'react';

const evidenceTypes = [
  ['credit_report', 'Credit report'],
  ['statement', 'Statement'],
  ['payment_record', 'Payment record'],
  ['identity_document', 'Identity document'],
  ['correspondence', 'Correspondence'],
  ['other', 'Other']
] as const;

export function EvidenceUploadForm({ clientId }: { clientId: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(event.currentTarget);
    form.set('clientId', clientId);
    try {
      const response = await fetch('/api/evidence/upload', { method: 'POST', body: form });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error || 'Unable to upload evidence.');
        return;
      }
      window.location.reload();
    } catch {
      setError('Evidence service unavailable.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="appForm compactForm" onSubmit={submit}>
      <label>Evidence type<select name="type" defaultValue="credit_report">{evidenceTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label>Label<input name="label" minLength={2} maxLength={240} placeholder="Experian report 2026-08-15" required /></label>
      <label>Private file<input name="file" type="file" accept="application/pdf,image/jpeg,image/png,image/webp,text/plain" required /></label>
      {error ? <div className="formError">{error}</div> : null}
      <button className="primaryButton" disabled={busy} type="submit">{busy ? 'Uploading…' : 'Upload evidence'}</button>
    </form>
  );
}
