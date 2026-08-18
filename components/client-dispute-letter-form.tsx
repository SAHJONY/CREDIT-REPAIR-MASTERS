'use client';

import { FormEvent, useState } from 'react';

type ClientOption = { id: string; name: string };
type Draft = {
  subject: string;
  body: string;
  letterhead: { clientName: string; clientAddress: string; recipientName: string; recipientAddress: string };
  requiresClientReview: true;
  requiresApproval: true;
  externalExecutionEnabled: false;
  warnings: string[];
};

export function ClientDisputeLetterForm({ clients }: { clients: ClientOption[] }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState<Draft | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setDraft(null);
    const form = new FormData(event.currentTarget);
    const selected = clients.find((client) => client.id === String(form.get('clientId'))) ?? clients[0];
    const supportingDocuments = String(form.get('supportingDocuments') || '').split(/\n|,/).map((item) => item.trim()).filter(Boolean);
    const relevantDates = String(form.get('relevantDates') || '').split(/\n|,/).map((item) => item.trim()).filter(Boolean);
    const payload = {
      clientName: selected?.name || 'Client',
      clientAddress: String(form.get('clientAddress') || ''),
      recipientName: String(form.get('recipientName') || ''),
      recipientAddress: String(form.get('recipientAddress') || ''),
      accountOrReference: String(form.get('accountOrReference') || ''),
      disputedField: String(form.get('disputedField') || ''),
      currentReporting: String(form.get('currentReporting') || ''),
      clientPosition: String(form.get('clientPosition') || ''),
      factualBasis: String(form.get('factualBasis') || ''),
      supportingDocuments,
      requestedResolution: String(form.get('requestedResolution') || ''),
      relevantDates,
      priorContact: String(form.get('priorContact') || ''),
      tone: String(form.get('tone') || 'straightforward')
    };

    try {
      const response = await fetch('/api/dispute-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json() as { draft?: Draft; error?: string };
      if (!response.ok || !data.draft) throw new Error(data.error || 'LETTER_DRAFT_FAILED');
      setDraft(data.draft);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'LETTER_DRAFT_FAILED');
    } finally {
      setBusy(false);
    }
  }

  return <div>
    <form onSubmit={submit} className="formGrid">
      <label>Client<select name="clientId" required>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label>
      <label>Writing tone<select name="tone" defaultValue="straightforward"><option value="straightforward">Straightforward</option><option value="warm">Warm</option><option value="concise">Concise</option><option value="formal">Formal, but natural</option></select></label>
      <label>Client mailing address<input name="clientAddress" autoComplete="street-address" /></label>
      <label>Recipient / bureau<input name="recipientName" required placeholder="e.g. TransUnion" /></label>
      <label>Recipient address<input name="recipientAddress" /></label>
      <label>Account/reference (masked)<input name="accountOrReference" placeholder="e.g. account ending 4821" /></label>
      <label>What field is wrong?<input name="disputedField" required placeholder="Balance, payment history, date, ownership…" /></label>
      <label>What does the report currently say?<textarea name="currentReporting" required /></label>
      <label>What does the client say is correct?<textarea name="clientPosition" required /></label>
      <label>Why? State the confirmed facts<textarea name="factualBasis" required placeholder="Use only facts the client confirmed or evidence supports." /></label>
      <label>Supporting documents<textarea name="supportingDocuments" required placeholder="One document per line" /></label>
      <label>Relevant dates<textarea name="relevantDates" placeholder="One date/event per line" /></label>
      <label>Prior contact, if any<textarea name="priorContact" placeholder="Only include calls, letters or responses that actually occurred." /></label>
      <label>What result is the client requesting?<textarea name="requestedResolution" required placeholder="Specific correction or investigation requested." /></label>
      <div className="guardrail">This tool drafts from confirmed facts only. It does not create identity-theft claims, fabricate evidence, add fake personal details, or attempt to defeat AI-detection systems. The client must review the finished draft before approval.</div>
      <button className="primaryButton" type="submit" disabled={busy || !clients.length}>{busy ? 'Drafting…' : 'Create client-voice draft'}</button>
    </form>

    {error ? <div className="errorState" style={{ marginTop: 14 }}>Draft not created: {error.replaceAll('_', ' ')}</div> : null}
    {draft ? <div className="documentCard" style={{ marginTop: 18 }}>
      <div className="label">CLIENT-VOICE DRAFT · REVIEW REQUIRED</div>
      <h3>{draft.subject}</h3>
      <div className="small">{draft.letterhead.clientName}{draft.letterhead.clientAddress ? ` · ${draft.letterhead.clientAddress}` : ''}</div>
      <div className="small">To: {draft.letterhead.recipientName}{draft.letterhead.recipientAddress ? ` · ${draft.letterhead.recipientAddress}` : ''}</div>
      <pre style={{ whiteSpace: 'pre-wrap', marginTop: 14 }}>{draft.body}</pre>
      <div className="guardrail" style={{ marginTop: 12 }}>{draft.warnings.join(' ')}</div>
      <span className="pill medium">NOT SUBMITTED · CLIENT APPROVAL REQUIRED</span>
    </div> : null}
  </div>;
}
