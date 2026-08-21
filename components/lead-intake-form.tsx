'use client';

import { FormEvent, useState } from 'react';

type Props = {
  serviceId: string;
  serviceName: string;
  audience: 'consumer' | 'business' | 'b2b';
  source: string;
  medium: string;
  campaign: string;
};

export function LeadIntakeForm({ serviceId, serviceName, audience, source, medium, campaign }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ reference: string; message: string } | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSuccess(null);

    const form = new FormData(event.currentTarget);
    const body = {
      serviceId,
      name: String(form.get('name') || ''),
      email: String(form.get('email') || ''),
      phone: String(form.get('phone') || ''),
      state: String(form.get('state') || ''),
      goal: String(form.get('goal') || ''),
      consent: form.get('consent') === 'on',
      website: String(form.get('website') || ''),
      source,
      medium,
      campaign
    };

    try {
      const response = await fetch('/api/growth/leads', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body)
      });
      const payload = await response.json();
      if (!response.ok || !payload.received) {
        setError(payload.error === 'LEAD_DELIVERY_NOT_CONFIGURED'
          ? 'Online qualification is temporarily unavailable. Please use the secure client portal if you already have an account.'
          : 'We could not submit the qualification request. Please verify the information and try again.');
        return;
      }
      setSuccess({ reference: payload.reference || 'received', message: payload.message || 'Qualification request received.' });
      event.currentTarget.reset();
    } catch {
      setError('We could not submit the qualification request. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  if (success) {
    return (
      <div className="formSuccess" style={{ marginTop: 18 }}>
        <strong>{success.message}</strong>
        <div style={{ marginTop: 6 }}>Reference: {success.reference}</div>
        <div style={{ marginTop: 6 }}>A New850 team member can use the information you authorized for this inquiry to evaluate fit and next steps. No score increase, deletion, financing approval, or other outcome is guaranteed.</div>
      </div>
    );
  }

  return (
    <form className="appForm" onSubmit={submit}>
      <div>
        <div className="label">Qualification request</div>
        <h2>Start with {serviceName}</h2>
        <p className="small">This is a fit and onboarding request, not a credit bureau dispute, contract acceptance, lender application, or payment authorization.</p>
      </div>

      <div className="formGrid">
        <label>Full name<input name="name" autoComplete="name" minLength={2} maxLength={100} required /></label>
        <label>Email<input name="email" type="email" autoComplete="email" maxLength={160} required /></label>
        <label>Phone (optional)<input name="phone" type="tel" autoComplete="tel" maxLength={30} /></label>
        <label>State<input name="state" autoComplete="address-level1" minLength={2} maxLength={2} placeholder="FL" required /></label>
      </div>

      <label>
        Primary goal
        <input name="goal" minLength={5} maxLength={700} placeholder={audience === 'b2b' ? 'Example: run a 3-person financial-readiness team on one governed OS' : audience === 'business' ? 'Example: improve business funding readiness and documentation' : 'Example: prepare to finance a home, car, loan, card or other purchase'} required />
      </label>

      <label style={{ display: 'none' }} aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>

      <label style={{ display: 'flex', gridTemplateColumns: 'auto 1fr', alignItems: 'start', gap: 10 }}>
        <input name="consent" type="checkbox" required style={{ width: 18, marginTop: 2 }} />
        <span>I authorize New850.com to contact me about this request. I understand this does not authorize access to bureau accounts, submission of disputes, a lender application, new credit, financial transactions, or payment collection.</span>
      </label>

      <button className="primaryButton" type="submit" disabled={busy}>{busy ? 'Submitting securely…' : 'Request qualification'}</button>
      {error ? <div className="formError">{error}</div> : null}
      <div className="small">Attribution: {source || 'direct'}{medium ? ` / ${medium}` : ''}{campaign ? ` / ${campaign}` : ''}. Contact data is delivered only to configured business lead channels; the analytics ledger stores PII-minimized conversion metadata.</div>
    </form>
  );
}
