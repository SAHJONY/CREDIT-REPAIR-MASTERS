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

  return (
    <main>
      <header className="appHeader">
        <div>
          <div className="kicker">NEW850.COM / GROWTH / LEAD INBOX</div>
          <h1>Delivered qualification requests.</h1>
          <p className="subtitle">Tenant-scoped durable lead delivery. Synthetic verification records are excluded from real demand counts.</p>
        </div>
        <div className="headerActions">
          <Link className="secondaryButton" href="/growth">Revenue Proof OS</Link>
          <Link className="secondaryButton" href="/get-started">Public funnel</Link>
          <Link className="secondaryButton" href="/dashboard">Owner OS</Link>
        </div>
      </header>

      <section className="grid">
        <div className="card span4"><div className="label">Real delivered leads</div><div className="value">{realLeads.length}</div><div className="small">current durable inbox</div></div>
        <div className="card span4"><div className="label">Verification records</div><div className="value">{leads.length - realLeads.length}</div><div className="small">excluded from commercial KPIs</div></div>
        <div className="card span4"><div className="label">Delivery rail</div><div className="value" style={{ fontSize: 24 }}>Owner inbox</div><div className="small">Resend/webhook notifications are additive</div></div>

        <div className="card span12">
          <div className="label">Lead inbox</div>
          <h2>Newest qualification requests first</h2>
          {leads.length ? leads.map((lead) => (
            <div className="listRow" key={lead.reference}>
              <div>
                <strong>{lead.isTest ? '[TEST] ' : ''}{lead.name} · {lead.serviceName}</strong>
                <div className="small">{lead.email}{lead.phone ? ` · ${lead.phone}` : ''} · {lead.state}</div>
                <div className="small">{lead.goal}</div>
                <div className="small">{lead.source} / {lead.medium || 'none'} / {lead.campaign || 'none'} · {new Date(lead.createdAt).toLocaleString()}</div>
              </div>
              <span className={`pill ${lead.isTest ? 'medium' : 'low'}`}>{lead.deliveryChannel}</span>
            </div>
          )) : <div className="emptyState">No delivered leads yet.</div>}
        </div>

        <div className="guardrail span12">Lead contact data stays inside approved business systems. Do not place SSNs, bureau credentials, full account numbers, or identity documents in lead notes or email notifications.</div>
      </section>
    </main>
  );
}
