import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isDemoClient } from '@/lib/demo-fixtures';
import { getBusinessSession } from '@/lib/session-access';
import { getPlatformStore } from '@/lib/platform-store';
import { resolveProductionReadiness } from '@/lib/production-readiness';

export const dynamic = 'force-dynamic';

const scenarios = [
  { name: 'Validation', consumer: 50, consumerRevenue: 650, agencies: 10, agencyArpa: 299, advisory: 8, advisoryRevenue: 1000 },
  { name: 'Base', consumer: 400, consumerRevenue: 850, agencies: 40, agencyArpa: 400, advisory: 30, advisoryRevenue: 1200 },
  { name: 'Scale', consumer: 1200, consumerRevenue: 1000, agencies: 150, agencyArpa: 450, advisory: 100, advisoryRevenue: 1500 }
];

function dollars(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export default async function GrowthPage() {
  const session = await getBusinessSession();
  if (!session) redirect('/auth/sign-in');
  if (session.mfaRequired && !session.mfaAssured) redirect('/auth/mfa');

  const store = getPlatformStore();
  const [clients, runs, productionReadiness] = await Promise.all([
    store.listClients(session.organizationId),
    store.listAgentRuns(session.organizationId, 100),
    resolveProductionReadiness(session.organizationId)
  ]);

  const realClients = clients.filter((client) => !isDemoClient(client));
  const active = realClients.filter((client) => client.status === 'active').length;
  const onboarding = realClients.filter((client) => client.status === 'onboarding').length;
  const completedRuns = runs.filter((run) => run.status === 'completed').length;
  const runSuccess = runs.length ? Math.round((completedRuns / runs.length) * 100) : 0;

  return (
    <main>
      <header className="appHeader">
        <div>
          <div className="kicker">CREDIT REPAIR MASTERS / OWNER GROWTH OS / v4.3</div>
          <h1>Growth Command Center</h1>
          <p className="subtitle">A commercial control plane that separates live operating facts from scenario forecasts. No projected revenue is presented as booked revenue.</p>
        </div>
        <div className="headerActions"><Link className="primaryButton" href="/get-started">Public funnel</Link><Link className="secondaryButton" href="/services">Pricing</Link><Link className="secondaryButton" href="/dashboard">Owner OS</Link></div>
      </header>

      <section className="grid">
        <div className="card span3"><div className="label">Real clients</div><div className="value">{realClients.length}</div><div className="small">{active} active · {onboarding} onboarding</div></div>
        <div className="card span3"><div className="label">Production controls</div><div className="value">{productionReadiness.summary.percent}%</div><div className="small">{productionReadiness.summary.ready}/{productionReadiness.summary.required} required gates</div></div>
        <div className="card span3"><div className="label">Agent reliability</div><div className="value">{runSuccess}%</div><div className="small">{completedRuns}/{runs.length || 0} recent runs completed</div></div>
        <div className="card span3"><div className="label">Commercial state</div><div className="value">Validate</div><div className="small">prove CAC, conversion, retention and realized revenue</div></div>

        <div className="card span12">
          <div className="label">12-month scenario model</div>
          <h2>Revenue targets, not accounting results</h2>
          <p className="small">Models combine consumer lifetime realized revenue, B2B monthly recurring software revenue, and business-credit advisory. They deliberately exclude financing income and unverified upsells.</p>
          <div className="grid" style={{ marginTop: 14 }}>
            {scenarios.map((scenario) => {
              const consumerRevenue = scenario.consumer * scenario.consumerRevenue;
              const b2bRevenue = scenario.agencies * scenario.agencyArpa * 12;
              const advisoryRevenue = scenario.advisory * scenario.advisoryRevenue;
              const total = consumerRevenue + b2bRevenue + advisoryRevenue;
              return (
                <div className="card span4" key={scenario.name}>
                  <div className="label">{scenario.name}</div>
                  <div className="value">{dollars(total)}</div>
                  <div className="small">12-month modeled revenue</div>
                  <div className="listRow"><span>Consumers</span><strong>{scenario.consumer}</strong></div>
                  <div className="listRow"><span>B2B accounts</span><strong>{scenario.agencies}</strong></div>
                  <div className="listRow"><span>Advisory clients</span><strong>{scenario.advisory}</strong></div>
                  <div className="listRow"><span>Modeled B2B MRR</span><strong>{dollars(scenario.agencies * scenario.agencyArpa)}</strong></div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card span6">
          <div className="label">7-day execution</div>
          <h2>Prove the transaction loop</h2>
          <div className="listRow"><div><strong>1. Funnel</strong><div className="small">Drive qualified traffic into /get-started instead of sending every visitor to sign-in.</div></div><span className="pill low">live</span></div>
          <div className="listRow"><div><strong>2. Conversion</strong><div className="small">Track qualified conversations, accepted customers and completed activations manually until event instrumentation is added.</div></div><span className="pill medium">measure</span></div>
          <div className="listRow"><div><strong>3. Delivery</strong><div className="small">Run real cases through report intake, evidence review, authorization and customer-safe milestones.</div></div><span className="pill low">operate</span></div>
          <div className="listRow"><div><strong>4. Billing</strong><div className="small">Collect only after the billing policy engine approves the service, jurisdiction and timing.</div></div><span className="pill low">gated</span></div>
        </div>

        <div className="card span6">
          <div className="label">30-day success criteria</div>
          <h2>Metrics that justify scale</h2>
          <div className="listRow"><span>Real B2C customers</span><strong>50+</strong></div>
          <div className="listRow"><span>B2B pilot accounts</span><strong>10+</strong></div>
          <div className="listRow"><span>Collected / contracted revenue</span><strong>$10K+</strong></div>
          <div className="listRow"><span>Consumer gross margin</span><strong>&gt;60%</strong></div>
          <div className="listRow"><span>SaaS gross margin</span><strong>&gt;80%</strong></div>
          <div className="listRow"><span>Standard-case human work</span><strong>&lt;30 min</strong></div>
          <div className="listRow"><span>Material compliance incidents</span><strong>0</strong></div>
        </div>

        <div className="card span12">
          <div className="row">
            <div><div className="label">Operating thesis</div><h2>B2C proves the OS; B2B compounds it.</h2><div className="small">Use the service business to validate workflows, economics and outcomes. Productize the proven operating layer for professionals and agencies rather than scaling labor linearly.</div></div>
            <Link className="primaryButton" href="/get-started?service=credit-os-professional">Open B2B path</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
