'use client';

import { FormEvent, useMemo, useState } from 'react';

type ClientOption = { id: string; displayName: string; state: string };
type PartnerOption = { id: string; name: string; vertical: string; status: string; minReadiness: number };

const verticals = ['loans','auto','mortgage','business','marketplace'] as const;

export function MarketplaceOwnerControls({ clients, partners }: { clients: ClientOption[]; partners: PartnerOption[] }) {
  const [partnerBusy, setPartnerBusy] = useState(false);
  const [handoffBusy, setHandoffBusy] = useState(false);
  const [partnerMessage, setPartnerMessage] = useState('');
  const [handoffMessage, setHandoffMessage] = useState('');
  const [vertical, setVertical] = useState<(typeof verticals)[number]>('loans');
  const [readiness, setReadiness] = useState(75);

  const eligiblePartnerOptions = useMemo(
    () => partners.filter((partner) => partner.status === 'active' && (partner.vertical === vertical || partner.vertical === 'marketplace') && partner.minReadiness <= readiness),
    [partners, readiness, vertical]
  );

  async function createPartner(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPartnerBusy(true);
    setPartnerMessage('');
    const form = new FormData(event.currentTarget);
    const states = String(form.get('states') || '').split(',').map((state) => state.trim().toUpperCase()).filter(Boolean);
    try {
      const response = await fetch('/api/marketplace/partners', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          vertical: form.get('vertical'),
          status: form.get('status'),
          minReadiness: Number(form.get('minReadiness') || 0),
          states,
          eligibility: {},
          disclosure: form.get('disclosure')
        })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Unable to save partner.');
      setPartnerMessage('Partner saved. Reloading marketplace controls…');
      window.setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      setPartnerMessage(error instanceof Error ? error.message : 'Unable to save partner.');
    } finally {
      setPartnerBusy(false);
    }
  }

  async function createHandoff(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHandoffBusy(true);
    setHandoffMessage('');
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/marketplace/handoffs', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          clientId: form.get('clientId'),
          partnerId: form.get('partnerId'),
          vertical,
          readinessScore: readiness,
          metadata: { initiatedFrom: 'owner_marketplace' }
        })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Unable to create handoff.');
      setHandoffMessage(`Handoff created for ${payload.partner?.name || 'eligible partner'}.`);
      window.setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      setHandoffMessage(error instanceof Error ? error.message : 'Unable to create handoff.');
    } finally {
      setHandoffBusy(false);
    }
  }

  return (
    <section className="grid">
      <div className="card span6">
        <div className="label">PARTNER ADMINISTRATION</div>
        <h2>Add a governed marketplace partner</h2>
        <form className="appForm compactForm" onSubmit={createPartner}>
          <label>Partner name<input name="name" required minLength={2} placeholder="Licensed provider or approved partner" /></label>
          <label>Vertical<select name="vertical" defaultValue="loans">{verticals.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <label>Status<select name="status" defaultValue="inactive"><option value="inactive">Inactive</option><option value="active">Active</option><option value="paused">Paused</option></select></label>
          <label>Minimum readiness<input name="minReadiness" type="number" min="0" max="100" defaultValue="70" /></label>
          <label>States<input name="states" placeholder="FL, GA, OH — leave blank if coverage is not state-restricted" /></label>
          <label>Customer disclosure<textarea name="disclosure" rows={3} placeholder="Relationship, role and required marketplace disclosure" /></label>
          {partnerMessage ? <div className="small">{partnerMessage}</div> : null}
          <button className="primaryButton" type="submit" disabled={partnerBusy}>{partnerBusy ? 'Saving…' : 'Save Partner'}</button>
        </form>
      </div>

      <div className="card span6">
        <div className="label">CONSENTED MATCHING</div>
        <h2>Create a customer-to-partner handoff</h2>
        <p className="small">This action remains fail-closed unless the customer has an active marketplace partner-sharing authorization and the selected partner is eligible.</p>
        <form className="appForm compactForm" onSubmit={createHandoff}>
          <label>Client<select name="clientId" required defaultValue=""><option value="" disabled>Select client</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.displayName} · {client.state}</option>)}</select></label>
          <label>Vertical<select value={vertical} onChange={(event) => setVertical(event.target.value as (typeof verticals)[number])}>{verticals.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <label>Readiness score<input type="number" min="0" max="100" value={readiness} onChange={(event) => setReadiness(Number(event.target.value))} /></label>
          <label>Eligible partner<select name="partnerId" required defaultValue=""><option value="" disabled>{eligiblePartnerOptions.length ? 'Select eligible partner' : 'No eligible partner configured'}</option>{eligiblePartnerOptions.map((partner) => <option key={partner.id} value={partner.id}>{partner.name} · minimum {partner.minReadiness}</option>)}</select></label>
          {handoffMessage ? <div className="small">{handoffMessage}</div> : null}
          <button className="primaryButton" type="submit" disabled={handoffBusy || !eligiblePartnerOptions.length}>{handoffBusy ? 'Creating…' : 'Create Consented Handoff'}</button>
        </form>
      </div>
    </section>
  );
}
