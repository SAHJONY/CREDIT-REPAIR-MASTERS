'use client';

import { useEffect, useState } from 'react';

type Status = { required: boolean; configured?: boolean; enrolled?: boolean; lockedUntil?: string | null };
type Enrollment = { secret: string; otpauthUri: string; recoveryCodes: string[] };

export function MfaForm() {
  const [status, setStatus] = useState<Status | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const response = await fetch('/api/mfa', { cache: 'no-store' });
    setStatus(await response.json());
  }

  useEffect(() => { void refresh(); }, []);

  async function post(body: Record<string, string>) {
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/mfa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'MFA operation failed');
      return data;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'MFA operation failed');
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function enroll() {
    const data = await post({ action: 'enroll' });
    if (data) setEnrollment(data as Enrollment);
  }

  async function verifyEnrollment() {
    const data = await post({ action: 'verify_enrollment', code });
    if (data) {
      setMessage('MFA enrolled and verified. Privileged session assurance is active.');
      setCode('');
      await refresh();
    }
  }

  async function challenge() {
    const data = await post({ action: 'challenge', code });
    if (data) {
      setMessage('MFA verified. Privileged session assurance is active.');
      setCode('');
      window.location.href = '/dashboard';
    }
  }

  if (!status) return <div className="emptyState">Checking MFA status…</div>;
  if (!status.required) return <div className="emptyState">MFA is not required for this role.</div>;
  if (!status.configured) return <div className="emptyState">MFA encryption is not configured in the production environment. Enrollment is fail-closed.</div>;

  return (
    <div>
      {!status.enrolled ? (
        <>
          <p className="small">Enroll an authenticator app using the secret or otpauth URI below. Recovery codes are shown only during enrollment; store them offline.</p>
          {!enrollment ? <button className="primaryButton" disabled={busy} onClick={enroll}>Start MFA enrollment</button> : (
            <div style={{ marginTop: 14 }}>
              <div className="label">Authenticator secret</div>
              <code>{enrollment.secret}</code>
              <div className="label" style={{ marginTop: 12 }}>Authenticator URI</div>
              <div className="small" style={{ wordBreak: 'break-all' }}>{enrollment.otpauthUri}</div>
              <div className="label" style={{ marginTop: 12 }}>Recovery codes — save now</div>
              <div className="grid" style={{ marginTop: 8 }}>{enrollment.recoveryCodes.map((item) => <code className="card span3" key={item}>{item}</code>)}</div>
              <div style={{ marginTop: 16 }}>
                <input aria-label="Authenticator code" inputMode="numeric" value={code} onChange={(event) => setCode(event.target.value)} placeholder="6-digit code" />
                <button className="primaryButton" disabled={busy || code.length < 6} onClick={verifyEnrollment} style={{ marginLeft: 8 }}>Verify & enable MFA</button>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <p className="small">Enter the current authenticator code or one unused recovery code to establish a privileged session.</p>
          {status.lockedUntil ? <div className="emptyState">MFA is temporarily locked until {new Date(status.lockedUntil).toLocaleString()}.</div> : null}
          <input aria-label="MFA code" value={code} onChange={(event) => setCode(event.target.value)} placeholder="Authenticator or recovery code" />
          <button className="primaryButton" disabled={busy || code.length < 6} onClick={challenge} style={{ marginLeft: 8 }}>Verify MFA</button>
        </>
      )}
      {message ? <div className="small" style={{ marginTop: 12 }}>{message}</div> : null}
    </div>
  );
}
