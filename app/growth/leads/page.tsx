import Link from 'next/link';
import { redirect } from 'next/navigation';
import { listGrowthLeads } from '@/lib/growth-lead-store';
import { getBusinessSession } from '@/lib/session-access';

export const dynamic = 'force-dynamic';

export default async function GrowthLeadsPage() {
  const session = await getBusinessSession();
  if (!session) redirect('/auth/sign-in');
  if (session.mfaRequired && !session.mfaAssured) redirect('/auth/mfa');

  const leads = await listGrowthLeads(session.organizationId, 100);
  const realLeads = leads.filter((lead) => !lead.isTest);
  const newLeads = realLeads.filter((lead) => lead.status === 'new');

  return (
    <main>
      <header className="appHeader">
        <div>
          <div className="kicker">NEW850.COM / OWNER OS / LEAD INBOX</div>
          <h1>Qualification requests</h1>
          <p className="subtitle">This is the business inbox for new financing-readiness prospects. Review the request, contact the prospect, qualify the need and convert the right prospect into a managed client.</p>
        </div>
        <div className="headerActions">
          <Link className="primaryButton" href="/owner">Owner OS</Link>
          <Link className="secondaryButton" href="/clients">Clients</Link>
          <Link className="secondaryButton" href="/growth">Growth</Link>
          <Link className="secondaryButton" href="/get-started">Public Funnel</Link>
        </div>
      </header>

      <section className="grid">
        <div className="card span4"><div className="label">Needs review</div><div className="value">{newLeads.length}</div><div className="small">new real qualification requests</div></div>
        <div className="card span4"><div className="label">Real leads</div><div className="value">{realLeads.length}</div><div className="small">current durable business inbox</div></div>
        <div className="card span4"><div className="label">Verification records</div><div className="value">{leads.length - realLeads.length}</div><div className="small">excluded from commercial KPIs</div></div>

        <div className="card span12">
          <div className="row">
            <div><div className="label">BUSINESS INBOX</div><h2>Newest qualification requests first</h2></div>
            <Link className="secondaryButton" href="/clients">Go to client management</Link>
          </div>
          {leads.length ? leads.map((lead) => (
            <div className="listRow" key={lead.reference}>
              <div>
                <strong>{lead.isTest ? '[TEST] ' : ''}{lead.name} · {lead.serviceName}</strong>
                <div className="small">{lead.email}{lead.phone ? ` · ${lead.phone}` : ''} · {lead.state}</div>
                <div className="small">Goal: {lead.goal}</div>
                <div className="small">Source: {lead.source} / {lead.medium || 'none'} / {lead.campaign || 'none'} · received {new Date(lead.createdAt).toLocaleString()}</div>
                <div className="small">Reference: {lead.reference}</div>
              </div>
              <span className={`pill ${lead.isTest ? 'medium' : lead.status === 'new' ? 'medium' : 'low'}`}>{lead.isTest ? 'verification' : lead.status}</span>
            </div>
          )) : <div className="emptyState">No delivered leads yet.</div>}
        </div>

        <div className="guardrail span12">Lead contact data stays inside approved business systems. Do not place SSNs, bureau credentials, full account numbers, or identity documents in lead notes or email notifications.</div>
      </section>
    </main>
  );
}
