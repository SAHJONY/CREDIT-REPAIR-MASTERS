'use client';

import { FormEvent, useState } from 'react';

type ClientOption = { id: string; name: string };

export function DocumentUploadForm({ clients }: { clients: ClientOption[] }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/documents/upload', { method: 'POST', body: new FormData(event.currentTarget) });
      const payload = await response.json();
      if (!response.ok) { setError(payload.error || 'Unable to upload document.'); return; }
      window.location.reload();
    } catch { setError('Document service unavailable.'); }
    finally { setBusy(false); }
  }

  return <form className="appForm compactForm" onSubmit={submit}>
    <label>Customer<select name="clientId" required>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label>
    <label>Document name<input name="label" minLength={2} maxLength={240} required placeholder="Signed service agreement" /></label>
    <label>Category<select name="category" defaultValue="other">
      <option value="agreement">Agreement</option><option value="credit_report">Credit report</option><option value="dispute">Dispute</option><option value="compliance">Compliance</option><option value="billing">Billing</option><option value="business_credit">Business credit</option><option value="identity">Identity</option><option value="evidence">Evidence</option><option value="other">Other</option>
    </select></label>
    <label>Private file<input name="file" type="file" accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/webp,text/plain" required /></label>
    <label><input name="shareNow" type="checkbox" value="true" /> Share with customer immediately</label>
    {error ? <div className="formError">{error}</div> : null}
    <button className="primaryButton" disabled={busy} type="submit">{busy ? 'Uploading…' : 'Upload document'}</button>
  </form>;
}