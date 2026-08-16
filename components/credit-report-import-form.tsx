'use client';

import { ChangeEvent, FormEvent, useMemo, useState } from 'react';

interface ProviderOption {
  id: string;
  name: string;
}

const MAX_FILE_BYTES = 4_000_000;
const ALLOWED_FILE_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain'
]);

function validateFile(file: File) {
  if (!ALLOWED_FILE_TYPES.has(file.type)) return 'Use PDF, JPEG, PNG, WebP, or plain text only.';
  if (file.size > MAX_FILE_BYTES) return 'Credit report files must be 4 MB or smaller.';
  return '';
}

export function CreditReportImportForm({
  clientId,
  providers
}: {
  clientId: string;
  providers: ProviderOption[];
}) {
  const [providerId, setProviderId] = useState(providers[0]?.id || 'consumer-upload');
  const [reportDate, setReportDate] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fileIssue, setFileIssue] = useState('');
  const [success, setSuccess] = useState('');

  const providerName = useMemo(
    () => providers.find((provider) => provider.id === providerId)?.name || 'Consumer credit report',
    [providerId, providers]
  );

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setError('');
    setSuccess('');
    const file = event.target.files?.[0];
    setFileIssue(file ? validateFile(file) : '');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSuccess('');
    const form = new FormData(event.currentTarget);
    const file = form.get('file');

    if (!(file instanceof File) || !file.size) {
      setError('Choose a credit report file before importing.');
      setBusy(false);
      return;
    }

    const validationIssue = validateFile(file);
    if (validationIssue) {
      setFileIssue(validationIssue);
      setBusy(false);
      return;
    }

    form.set('clientId', clientId);
    form.set('type', 'credit_report');
    form.set('label', `${providerName} credit report${reportDate ? ` ${reportDate}` : ''}`);

    try {
      const response = await fetch('/api/evidence/upload', { method: 'POST', body: form });
      const payload = await response.json();
      if (!response.ok) {
        setError(
          payload.error === 'CREDIT_REPORT_ANALYSIS_CONSENT_REQUIRED'
            ? 'Active credit-report-analysis consent is required before importing a report.'
            : payload.error || 'Unable to import credit report.'
        );
        return;
      }
      const evidenceId = payload.evidence?.id ? ` Evidence ${payload.evidence.id}.` : '';
      const checksum = payload.evidence?.sha256 ? ` SHA-256 ${String(payload.evidence.sha256).slice(0, 12)}… recorded.` : '';
      setSuccess(`${providerName} report imported securely.${evidenceId}${checksum} Verification status: unverified.`);
      window.setTimeout(() => window.location.reload(), 1600);
    } catch {
      setError('Credit report import service unavailable.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="appForm compactForm" onSubmit={submit}>
      <label>
        Report source
        <select value={providerId} onChange={(event) => setProviderId(event.target.value)}>
          {providers.map((provider) => <option key={provider.id} value={provider.id}>{provider.name}</option>)}
        </select>
      </label>
      <label>
        Report date
        <input type="date" value={reportDate} onChange={(event) => setReportDate(event.target.value)} required />
      </label>
      <label>
        Private report file
        <input name="file" type="file" accept="application/pdf,image/jpeg,image/png,image/webp,text/plain" onChange={handleFileChange} required />
      </label>
      <div className="small">Maximum 4 MB. File type and size are checked before upload and enforced again by the private vault.</div>
      {fileIssue ? <div className="formError">{fileIssue}</div> : null}
      {error ? <div className="formError">{error}</div> : null}
      {success ? <div className="guardrail">{success}</div> : null}
      <button className="primaryButton" disabled={busy || Boolean(fileIssue)} type="submit">{busy ? 'Importing…' : 'Import credit report securely'}</button>
    </form>
  );
}
