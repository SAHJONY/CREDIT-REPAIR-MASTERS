'use client';

import { useState } from 'react';

export function PortalCheckoutButton({ invoiceId }: { invoiceId: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function checkout() {
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/portal/payments/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ invoiceId })
      });
      const payload = await response.json();
      if (!response.ok || !payload.checkoutUrl) {
        setError(payload.error || 'Unable to start secure checkout.');
        return;
      }
      window.location.assign(payload.checkoutUrl);
    } catch {
      setError('Payment service unavailable.');
    } finally {
      setBusy(false);
    }
  }

  return <div>
    <button className="primaryButton" type="button" onClick={checkout} disabled={busy}>{busy ? 'Opening secure checkout…' : 'Pay securely'}</button>
    {error ? <div className="formError" style={{ marginTop: 8 }}>{error}</div> : null}
  </div>;
}
