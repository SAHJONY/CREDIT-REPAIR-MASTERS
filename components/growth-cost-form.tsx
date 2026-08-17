'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

function cents(value: FormDataEntryValue | null) {
  const amount = Number(String(value || '0'));
  if (!Number.isFinite(amount) || amount < 0) return NaN;
  return Math.round(amount * 100);
}

export function GrowthCostForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSaved(false);

    const form = new FormData(event.currentTarget);
    const acquisitionSpendCents = cents(form.get('acquisition'));
    const fulfillmentLaborCents = cents(form.get('labor'));
    const softwareAiCents = cents(form.get('softwareAi'));
    if (![acquisitionSpendCents, fulfillmentLaborCents, softwareAiCents].every(Number.isFinite)) {
      setError('Enter valid non-negative dollar amounts.');
      setBusy(false);
      return;
    }

    try {
      const response = await fetch('/api/growth/costs', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          acquisitionSpendCents,
          fulfillmentLaborCents,
          softwareAiCents,
          note: String(form.get('note') || '')
        })
      });
      const payload = await response.json();
      if (!response.ok || !payload.saved) {
        setError('Cost snapshot could not be saved. Owner/admin access with MFA is required.');
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError('Cost snapshot could not be saved.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="appForm" onSubmit={submit}>
      <div className="formGrid">
        <label>30-day acquisition spend ($)<input name="acquisition" type="number" min="0" step="0.01" defaultValue="0" required /></label>
        <label>30-day fulfillment labor ($)<input name="labor" type="number" min="0" step="0.01" defaultValue="0" required /></label>
        <label>30-day software + AI ($)<input name="softwareAi" type="number" min="0" step="0.01" defaultValue="0" required /></label>
        <label>Note<input name="note" maxLength={180} placeholder="Example: Meta pilot + contractor hours" /></label>
      </div>
      <button className="secondaryButton" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save 30-day cost snapshot'}</button>
      {saved ? <div className="formSuccess">Cost evidence saved to the tenant audit ledger. Profitability metrics now use the latest snapshot.</div> : null}
      {error ? <div className="formError">{error}</div> : null}
      <div className="small">Use posted business costs for the same trailing 30-day window. This snapshot is operating evidence, not an accounting ledger or tax record.</div>
    </form>
  );
}
