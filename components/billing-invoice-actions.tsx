'use client';

import { useState } from 'react';

export function BillingInvoiceActions({ invoiceId, status, checkoutUrl }: { invoiceId: string; status: string; checkoutUrl?: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function voidInvoice() {
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`/api/billing/invoices/${encodeURIComponent(invoiceId)}/void`, { method: 'POST' });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error || 'Unable to void invoice.');
        return;
      }
      window.location.reload();
    } catch {
      setError('Billing service unavailable.');
    } finally {
      setBusy(false);
    }
  }

  return <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
    {checkoutUrl ? <a className="secondaryButton" href={checkoutUrl} target="_blank" rel="noreferrer">Open checkout</a> : null}
    {(status === 'open' || status === 'checkout_pending') ? <button className="secondaryButton" type="button" disabled={busy} onClick={voidInvoice}>{busy ? 'Voiding…' : 'Void'}</button> : null}
    {error ? <span className="formError">{error}</span> : null}
  </div>;
}
