import Link from 'next/link';
import { redirect } from 'next/navigation';
import { MarketplaceOwnerControls } from '@/components/marketplace-owner-controls';
import { isDemoClient } from '@/lib/demo-fixtures';
import { getBusinessSession } from '@/lib/session-access';
import { getPlatformStore } from '@/lib/platform-store';
import { listMarketplaceHandoffs, listMarketplaceOutcomes, listMarketplacePartners } from '@/lib/marketplace-store';

export const dynamic = 'force-dynamic';

export default async function OwnerMarketplacePage() {
  const session = await getBusinessSession();
  if (!session) redirect('/auth/sign-in');
  if (session.member.role !== 'owner') redirect('/dashboard');
  if (session.mfaRequired && !session.mfaAssured) redirect('/auth/mfa');

  const store = getPlatformStore();
  const [partners, handoffs, outcomes, clients] = await Promise.all([
    listMarketplacePartners(session.organizationId),
    listMarketplaceHandoffs(session.organizationId, 100),
    listMarketplaceOutcomes(session.organizationId, 100),
    store.listClients(session.organizationId)
  ]);

  const realClients = clients.filter((client) => !isDemoClient(client));
  const activePartners = partners.filter((partner) => partner.status === 'active');
  const sentHandoffs = handoffs.filter((handoff) => handoff.status === 'sent' || handoff.status === 'accepted');
  const completedOutcomes = outcomes.filter((outcome) => outcome.outcome === 'funded' || outcome.outcome === 'purchased');
  const trackedRevenue = outcomes.reduce((sum, outcome) => sum + (outcome.revenueCents || 0), 0);
  const conversion = sentHandoffs.length ? Math.round((completedOutcomes.length / sentHandoffs.length) * 100) : 0;

  return (
    <main>
      <header className="ownerHero">
        <div>
          <div className="kicker">NEW850 OWNER OS / MARKETPLACE CONTROL</div>
          <h1>Partner Marketplace Command Center</h1>
          <p className="subtitle">Control partner eligibility, consented handoffs, customer outcomes and attributable marketplace revenue without pay-to-play ranking.</p>
        </div>
        <div className="ownerNav">
          <Link className="secondaryButton" href="/owner">Owner OS</Link>
          <Link className="secondaryButton" href="/marketplace">Public Marketplace</Link>
          <Link className="secondaryButton" href="/loan-readiness">Readiness</Link>
          <Link className="secondaryButton" href="/compliance">Compliance</Link>
        </div>
      </header>

      <section className="ownerKpiGrid">
        <div className="ownerKpi"><span>ACTIVE PARTNERS</span><strong>{activePartners.length}</strong><small>{partners.length} total configured</small></div>
        <div className="ownerKpi"><span>CONSENTED HANDOFFS</span><strong>{handoffs.length}</strong><small>{sentHandoffs.length} sent or accepted</small></div>
        <div className="ownerKpi"><span>FUNDED / PURCHASED</span><strong>{completedOutcomes.length}</strong><small>{conversion}% tracked conversion</small></div>
        <div className="ownerKpi"><span>TRACKED REVENUE</span><strong>${(trackedRevenue / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}</strong><small>reported marketplace attribution</small></div>
      </section>

      <MarketplaceOwnerControls
        clients={realClients.map((client) => ({ id: client.id, displayName: client.displayName, state: client.state }))}
        partners={partners.map((partner) => ({ id: partner.id, name: partner.name, vertical: partner.vertical, status: partner.status, minReadiness: partner.minReadiness }))}
      />

      <section className="grid">
        <div className="card span12">
          <div className="label">GOVERNANCE</div>
          <h2>Customer fit before partner economics.</h2>
          <p className="small">Eligibility is based on vertical, readiness threshold, customer state and documented partner criteria. Partner compensation is not an input to the neutral eligibility function. No customer handoff may be written without an active marketplace partner-sharing consent.</p>
        </div>

        <div className="card span6">
          <div className="label">PARTNER NETWORK</div><h2>Configured providers</h2>
          {partners.length ? partners.map((partner) => (
            <div className="listRow" key={partner.id}>
              <div><strong>{partner.name}</strong><div className="small">{partner.vertical} · minimum readiness {partner.minReadiness} · {partner.states.length ? partner.states.join(', ') : 'national/unspecified coverage'}</div></div>
              <span className={`pill ${partner.status === 'active' ? 'low' : partner.status === 'paused' ? 'medium' : 'high'}`}>{partner.status}</span>
            </div>
          )) : <div className="emptyState">No financial partners are configured yet. The marketplace remains fail-closed rather than displaying invented providers.</div>}
        </div>

        <div className="card span6">
          <div className="label">RECENT HANDOFFS</div><h2>Consented partner routing</h2>
          {handoffs.length ? handoffs.slice(0, 12).map((handoff) => (
            <div className="listRow" key={handoff.id}>
              <div><strong>{handoff.vertical} · readiness {handoff.readinessScore}</strong><div className="small">client {handoff.clientId} · partner {handoff.partnerId} · {new Date(handoff.createdAt).toLocaleString()}</div></div>
              <span className={`pill ${handoff.status === 'accepted' ? 'low' : handoff.status === 'sent' ? 'medium' : 'high'}`}>{handoff.status}</span>
            </div>
          )) : <div className="emptyState">No customer data has been handed to a partner.</div>}
        </div>

        <div className="card span12">
          <div className="label">OUTCOME LEDGER</div><h2>Applications, approvals, funding and purchases</h2>
          {outcomes.length ? outcomes.slice(0, 20).map((outcome) => (
            <div className="listRow" key={outcome.id}>
              <div><strong>{outcome.outcome.replaceAll('_', ' ')}</strong><div className="small">client {outcome.clientId} · partner {outcome.partnerId} · reported by {outcome.reportedBy} · {new Date(outcome.createdAt).toLocaleString()}</div></div>
              <span className={`pill ${outcome.outcome === 'funded' || outcome.outcome === 'purchased' || outcome.outcome === 'approved' ? 'low' : outcome.outcome === 'declined' ? 'high' : 'medium'}`}>{outcome.amount ? `$${outcome.amount.toLocaleString('en-US')}` : outcome.outcome}</span>
            </div>
          )) : <div className="emptyState">No partner outcomes reported yet. Revenue remains zero until a real outcome is attributed.</div>}
        </div>
      </section>
    </main>
  );
}
