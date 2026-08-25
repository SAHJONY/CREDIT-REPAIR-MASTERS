'use client';

import { useState } from 'react';

export function DocumentWorkflowActions({ id, clientId, state, versionSigned }: { id: string; clientId: string; state: string; versionSigned: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function run(action: 'request_signature' | 'mark_sent' | 'response_received') {
    setBusy(true);
    setError('');
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

  return <div style={{ display: 'grid', gap: 8 }}>
    <div className="headerActions">
      {state === 'internal' ? <button className="primaryButton" type="button" disabled={busy} onClick={() => run('request_signature')}>{busy ? 'Saving…' : 'Request Client Signature'}</button> : null}
      {state === 'signature_required' ? <span className="pill medium">WAITING FOR CLIENT SIGNATURE</span> : null}
      {state === 'signed' && versionSigned ? <button className="primaryButton" type="button" disabled={busy} onClick={() => run('mark_sent')}>{busy ? 'Saving…' : 'Mark Sent by New850'}</button> : null}
      {state === 'signed' && !versionSigned ? <button className="primaryButton" type="button" disabled={busy} onClick={() => run('request_signature')}>{busy ? 'Saving…' : 'Request New Signature'}</button> : null}
      {state === 'sent' ? <button className="secondaryButton" type="button" disabled={busy} onClick={() => run('response_received')}>{busy ? 'Saving…' : 'Record Response Received'}</button> : null}
      {state === 'response_received' ? <span className="pill low">RESPONSE RECEIVED</span> : null}
    </div>
    {error ? <div className="formError">{error}</div> : null}
  </div>;
}
