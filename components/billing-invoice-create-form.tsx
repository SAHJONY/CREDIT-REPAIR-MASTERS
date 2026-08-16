'use client';

import { FormEvent, useState } from 'react';

export function BillingInvoiceCreateForm({ clients, services }: {
  clients: Array<{ id: string; name: string; state: string }>;
  services: Array<{ id: string; name: string; priceCents: number }>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setDone('');
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/billing/invoices', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          clientId: form.get('clientId'),
          serviceId: form.get('serviceId'),
          milestoneLabel: form.get('milestoneLabel'),
          salesChannel: form.get('salesChannel'),
          serviceCompleted: form.get('serviceCompleted') === 'on',
          contractSigned: form.get('contractSigned') === 'on',
          cancellationWindowExpired: form.get('cancellationWindowExpired') === 'on',
          floridaBondAndTrustValidated: form.get('floridaBondAndTrustValidated') === 'on'
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        const reasons = payload.eligibility?.requiredActions?.join(' · ');
        setError(reasons || payload.error || 'Invoice cannot be issued.');
        return;
      }
      setDone(`Invoice ${payload.invoice.id} issued for $${(payload.invoice.amountCents / 100).toFixed(2)}.`);
      event.currentTarget.reset();
      setTimeout(() => window.location.reload(), 900);
    } catch {
      setError('Billing service unavailable.');
    } finally {
      setBusy(false);
    }
  }

  return <form className="appForm" onSubmit={submit}>
    <label>Client<select name="clientId" required defaultValue=""><option value="" disabled>Select client</option>{clients.map((client) => <option value={client.id} key={client.id}>{client.name} · {client.state}</option>)}</select></label>
    <label>Service<select name="serviceId" required defaultValue=""><option value="" disabled>Select service</option>{services.map((service) => <option value={service.id} key={service.id}>{service.name} · ${(service.priceCents / 100).toFixed(2)}</option>)}</select></label>
    <label>Completed milestone<input name="milestoneLabel" placeholder="Example: August strategy cycle completed" minLength={3} maxLength={180} required /></label>
    <label>Sales channel<select name="salesChannel" defaultValue="web"><option value="web">Web</option><option value="referral">Referral</option><option value="in_person">In person</option><option value="telemarketing">Telemarketing</option></select></label>
    <label><input name="serviceCompleted" type="checkbox" /> Contracted service/milestone is completed</label>
    <label><input name="contractSigned" type="checkbox" /> Required agreement is signed</label>
    <label><input name="cancellationWindowExpired" type="checkbox" /> Applicable cancellation window has expired</label>
    <label><input name="floridaBondAndTrustValidated" type="checkbox" /> Florida bond/trust workflow validated, if applicable</label>
    {error ? <div className="formError">{error}</div> : null}
    {done ? <div className="formSuccess">{done}</div> : null}
    <button className="primaryButton" type="submit" disabled={busy || !clients.length || !services.length}>{busy ? 'Checking eligibility…' : 'Issue eligible invoice'}</button>
  </form>;
}
