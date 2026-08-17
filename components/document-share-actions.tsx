'use client';

import { useState } from 'react';

export function DocumentShareActions({ id, clientId, shared }: { id: string; clientId: string; shared: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function setShared(next: boolean) {
    setBusy(true); setError('');
    try {
      const response = await fetch(`/api/documents/${encodeURIComponent(id)}/share`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientId, shared: next }) });
      const payload = await response.json();
      if (!response.ok) { setError(payload.error || 'Unable to update sharing.'); return; }
      window.location.reload();
    } catch { setError('Sharing service unavailable.'); }
    finally { setBusy(false); }
  }
  return <div>
    <div className="headerActions">
      <a className="secondaryButton" href={`/api/documents/${encodeURIComponent(id)}/content`} target="_blank" rel="noreferrer">View</a>
      <button className={shared ? 'secondaryButton' : 'primaryButton'} disabled={busy} onClick={() => setShared(!shared)} type="button">{busy ? 'Saving…' : shared ? 'Revoke' : 'Share'}</button>
    </div>
    {error ? <div className="formError">{error}</div> : null}
  </div>;
}