'use client';

import { FormEvent, useMemo, useState } from 'react';

interface ProviderOption {
  id: string;
  name: string;
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

  const providerName = useMemo(
    () => providers.find((provider) => provider.id === providerId)?.name || 'Consumer credit report',
    [providerId, providers]
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(event.currentTarget);
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
      window.location.reload();
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
        <input name="file" type="file" accept="application/pdf,image/jpeg,image/png,image/webp,text/plain" required />
      </label>
      {error ? <div className="formError">{error}</div> : null}
      <button className="primaryButton" disabled={busy} type="submit">{busy ? 'Importing…' : 'Import credit report'}</button>
    </form>
  );
}
