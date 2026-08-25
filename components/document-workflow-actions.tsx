'use client';

import { useState } from 'react';

type Bureau = 'equifax' | 'experian' | 'transunion';

export function DocumentWorkflowActions({
  id,
  clientId,
  state,
  versionSigned,
  mailConfigured
}: {
  id: string;
  clientId: string;
  state: string;
  versionSigned: boolean;
  mailConfigured: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [bureau, setBureau] = useState<Bureau>('equifax');

  async function run(action: 'request_signature' | 'mark_sent' | 'response_received') {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`/api/documents/${encodeURIComponent(id)}/workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, action })
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error || 'Unable to update document workflow.');
        return;
      }
      window.location.reload();
    } catch {
      setError('Document workflow service unavailable.');
    } finally {
      setBusy(false);
    }
  }

  async function sendCertifiedMail() {
    if (!window.confirm(`Send this exact signed letter to ${bureau.toUpperCase()} by certified USPS mail? This creates a real print-and-mail order.`)) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`/api/documents/${encodeURIComponent(id)}/mail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, bureau, confirmSend: true })
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error || 'Unable to submit this letter for certified mail.');
        return;
      }
      const tracking = payload.trackingNumber ? ` Tracking: ${payload.trackingNumber}` : '';
      setMessage(`Submitted to ${bureau.toUpperCase()} for certified mail.${tracking}`);
      window.setTimeout(() => window.location.reload(), 1000);
    } catch {
      setError('Certified mail service unavailable.');
    } finally {
      setBusy(false);
    }
  }

  const canPrint = versionSigned && ['signed', 'sent', 'response_received'].includes(state);

  return <div style={{ display: 'grid', gap: 8 }}>
    <div className="headerActions">
      {state === 'internal' ? <button className="primaryButton" type="button" disabled={busy} onClick={() => run('request_signature')}>{busy ? 'Saving…' : 'Request Client Signature'}</button> : null}
      {state === 'signature_required' ? <span className="pill medium">WAITING FOR CLIENT SIGNATURE</span> : null}
      {state === 'signed' && !versionSigned ? <button className="primaryButton" type="button" disabled={busy} onClick={() => run('request_signature')}>{busy ? 'Saving…' : 'Request New Signature'}</button> : null}
      {canPrint ? <a className="secondaryButton" href={`/api/documents/${encodeURIComponent(id)}/print`} target="_blank" rel="noreferrer">Print Signed Letter</a> : null}
    </div>

    {state === 'signed' && versionSigned ? <div style={{ display: 'grid', gap: 8 }}>
      <div className="small"><strong>Send directly to a credit bureau</strong> · USPS First-Class Certified Mail through the configured print-and-mail provider.</div>
      <div className="headerActions">
        <select value={bureau} onChange={(event) => setBureau(event.target.value as Bureau)} disabled={busy} aria-label="Credit bureau">
          <option value="equifax">Equifax</option>
          <option value="experian">Experian</option>
          <option value="transunion">TransUnion</option>
        </select>
        <button className="primaryButton" type="button" disabled={busy || !mailConfigured} onClick={sendCertifiedMail}>{busy ? 'Submitting…' : 'Print & Send Certified Mail'}</button>
        <button className="secondaryButton" type="button" disabled={busy} onClick={() => run('mark_sent')}>Record Manual Dispatch</button>
      </div>
      {!mailConfigured ? <div className="guardrail">Certified mail is fail-closed until the Lob API key and New850 return address are configured server-side. Printing remains available.</div> : null}
    </div> : null}

    {state === 'sent' ? <div className="headerActions"><span className="pill low">SENT BY NEW850</span><button className="secondaryButton" type="button" disabled={busy} onClick={() => run('response_received')}>{busy ? 'Saving…' : 'Record Response Received'}</button></div> : null}
    {state === 'response_received' ? <span className="pill low">RESPONSE RECEIVED</span> : null}
    {message ? <div className="formSuccess">{message}</div> : null}
    {error ? <div className="formError">{error}</div> : null}
  </div>;
}
