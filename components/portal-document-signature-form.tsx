'use client';

import { useState } from 'react';

export function PortalDocumentSignatureForm({ id, defaultName }: { id: string; defaultName: string }) {
  const [signerName, setSignerName] = useState(defaultName);
  const [confirmAccuracy, setConfirmAccuracy] = useState(false);
  const [authorizeSending, setAuthorizeSending] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function sign() {
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`/api/portal/documents/${encodeURIComponent(id)}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signerName, confirmAccuracy, authorizeSending })
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error || 'Unable to sign this document.');
        return;
      }
      window.location.reload();
    } catch {
      setError('Signature service unavailable.');
    } finally {
      setBusy(false);
    }
  }

  const ready = signerName.trim().length >= 2 && confirmAccuracy && authorizeSending;

  return <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
    <div className="portalNotice">Review the exact client-specific document above before signing. Your signature applies only to this locked version; New850 must request a new signature if the document changes.</div>
    <label>Electronic signature
      <input value={signerName} onChange={(event) => setSignerName(event.target.value)} autoComplete="name" />
    </label>
    <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}><input type="checkbox" checked={confirmAccuracy} onChange={(event) => setConfirmAccuracy(event.target.checked)} /> <span>I reviewed this specific document and confirm that the factual statements are accurate to the best of my knowledge.</span></label>
    <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}><input type="checkbox" checked={authorizeSending} onChange={(event) => setAuthorizeSending(event.target.checked)} /> <span>I electronically sign this document and authorize New850 to send this locked version on my behalf through the approved workflow.</span></label>
    <button className="primaryButton" type="button" disabled={busy || !ready} onClick={sign}>{busy ? 'Signing…' : 'Sign & Authorize Sending'}</button>
    {error ? <div className="formError">{error}</div> : null}
  </div>;
}
