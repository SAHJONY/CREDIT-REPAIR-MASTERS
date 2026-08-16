'use client';

import { FormEvent, useMemo, useState } from 'react';

const MAX_BYTES = 4_000_000;
const ACCEPTED = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'text/plain'];

type ProviderOption = { id: string; name: string };

export function PortalReportUploadForm({ providers }: { providers: ProviderOption[] }) {
  const [providerId, setProviderId] = useState(providers[0]?.id || 'annual-credit-report');
  const [reportDate, setReportDate] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const providerName = useMemo(() => providers.find((p) => p.id === providerId)?.name || 'Consumer credit report', [providerId, providers]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');
    const form = new FormData(event.currentTarget);
    const file = form.get('file');
    if (!(file instanceof File)) return setError('Choose a report file.');
    if (!ACCEPTED.includes(file.type)) return setError('Use PDF, JPEG, PNG, WebP, or text.');
    if (file.size > MAX_BYTES) return setError('The report must be 4 MB or smaller.');

    form.set('providerId', providerId);
    form.set('providerName', providerName);
    form.set('reportDate', reportDate);
    setBusy(true);
    try {
      const response = await fetch('/api/portal/evidence/upload', { method: 'POST', body: form });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error === 'CREDIT_REPORT_ANALYSIS_CONSENT_REQUIRED' ? 'Grant credit report analysis authorization before uploading.' : payload.error || 'Unable to upload report.');
        return;
      }
      setSuccess(`Secure upload complete. Evidence ${payload.evidence?.id || ''} was stored privately and is awaiting review.`);
      window.setTimeout(() => window.location.reload(), 900);
    } catch {
      setError('Secure upload service unavailable.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="appForm" onSubmit={submit}>
      <label>Report source<select value={providerId} onChange={(e) => setProviderId(e.target.value)}>{providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
      <label>Report date<input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} required /></label>
      <label>Credit report file<input name="file" type="file" accept="application/pdf,image/jpeg,image/png,image/webp,text/plain" required /></label>
      <div className="small">Maximum 4 MB. Files are stored in the private Evidence Vault.</div>
      {success ? <div className="formSuccess">{success}</div> : null}
      {error ? <div className="formError">{error}</div> : null}
      <button className="primaryButton" type="submit" disabled={busy}>{busy ? 'Uploading securely…' : 'Upload my report'}</button>
    </form>
  );
}
