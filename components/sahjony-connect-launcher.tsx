'use client';

import { useState } from 'react';

type Mode = 'text' | 'voice' | 'video';

type SessionResponse = {
  launch_url?: string;
  owner_url?: string;
  detail?: string;
  billing_mode?: string;
};

export function SahjonyConnectLauncher({ clientName }: { clientName: string }) {
  const [loading, setLoading] = useState<Mode | null>(null);
  const [message, setMessage] = useState('');

  async function start(mode: Mode) {
    setLoading(mode);
    setMessage('');
    try {
      const response = await fetch('/api/connect/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });
      const data = (await response.json().catch(() => ({}))) as SessionResponse;
      if (!response.ok || !data.launch_url) {
        throw new Error(data.detail || 'Unable to start secure communication session');
      }
      window.location.assign(data.launch_url);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to start secure communication session');
      setLoading(null);
    }
  }

  return (
    <section style={{ maxWidth: 980, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ border: '1px solid rgba(255,255,255,.12)', borderRadius: 24, padding: 28, background: 'linear-gradient(145deg,#08131f,#03070d)' }}>
        <div style={{ color: '#6ee7ff', fontSize: 12, letterSpacing: '.18em', fontWeight: 800 }}>NEW850 · SAHJONY CONNECT</div>
        <h1 style={{ fontSize: 'clamp(38px,6vw,72px)', lineHeight: .95, margin: '14px 0' }}>Secure communication, built into your portal.</h1>
        <p style={{ color: '#9fb3c1', lineHeight: 1.7, maxWidth: 760 }}>
          {clientName}, choose how you want to connect with New850. These sessions use SAHJONY CONNECT and are provided as part of your New850 experience.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginTop: 28 }}>
          {(['text','voice','video'] as Mode[]).map((mode) => (
            <button key={mode} onClick={() => start(mode)} disabled={Boolean(loading)} style={{ padding: 18, borderRadius: 16, border: '1px solid rgba(255,255,255,.14)', background: '#0b1b28', color: 'white', cursor: 'pointer', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em' }}>
              {loading === mode ? 'Starting…' : mode === 'text' ? 'Secure Chat' : mode === 'voice' ? 'Voice Call' : 'Video Call'}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 22, padding: 16, borderRadius: 14, background: 'rgba(255,255,255,.04)', color: '#9fb3c1', fontSize: 13, lineHeight: 1.6 }}>
          AI assistance is disabled by default for this financial-services pilot. Do not send Social Security numbers, passwords, full account numbers, bureau credentials, or identity documents in chat. Use the secure document portal for sensitive records.
        </div>
        {message ? <p style={{ color: '#ff9aa7', marginTop: 16 }}>{message}</p> : null}
      </div>
    </section>
  );
}
