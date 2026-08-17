import Link from 'next/link';
import { redirect } from 'next/navigation';
import { GrowthCostForm } from '@/components/growth-cost-form';
import { listBillingInvoices } from '@/lib/billing-store';
import { isDemoClient } from '@/lib/demo-fixtures';
import { getBusinessSession } from '@/lib/session-access';
import { getPlatformStore } from '@/lib/platform-store';
import { resolveProductionReadiness } from '@/lib/production-readiness';
import { getCommercialService } from '@/lib/service-catalog';

export const dynamic = 'force-dynamic';

type GateStatus = 'pass' | 'fail' | 'incomplete';

function dollars(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

function percent(value: number | null) {
  return value == null || !Number.isFinite(value) ? '—' : `${Math.round(value)}%`;
}

function centsFromMetadata(metadata: Record<string, string | number | boolean | null> | undefined, key: string) {
  const value = Number(metadata?.[key] ?? 0);
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function gateClass(status: GateStatus) {
  return status === 'pass' ? 'low' : status === 'fail' ? 'high' : 'medium';
}

export default async function GrowthPage() {
  const session = await getBusinessSession();
  if (!session) redirect('/auth/sign-in');
  if (session.mfaRequired && !session.mfaAssured) redirect('/auth/mfa');

  const store = getPlatformStore();
  const [clients, runs, audit, invoices, productionReadiness] = await Promise.all([
    store.listClients(session.organizationId),
    store.listAgentRuns(session.organizationId, 100),
    store.listAudit(session.organizationId, 500),
    listBillingInvoices(session.organizationId),
    resolveProductionReadiness(session.organizationId)
  ]);

  const now = Date.now();
  const cutoff30 = now - 30 * 24 * 60 * 60 * 1000;
  const within30 = (value?: string) => Boolean(value && new Date(value).getTime() >= cutoff30);

  const realClients = clients.filter((client) => !isDemoClient(client));
  const realClientIds = new Set(realClients.map((client) => client.id));
  const active = realClients.filter((client) => client.status === 'active').length;
  const onboarding = realClients.filter((client) => client.status === 'onboarding').length;
  const activated30 = realClients.filter((client) => within30(client.createdAt)).length;

  const completedRuns = runs.filter((run) => run.status === 'completed').length;
  const runSuccess = runs.length ? Math.round((completedRuns / runs.length) * 100) : 0;

  const audit30 = audit.filter((record) => within30(record.createdAt));
  const leads30 = audit30.filter((record) => record.action === 'growth.lead_submitted');
  const leadDeliveryFailures30 = audit30.filter((record) => record.action === 'growth.lead_delivery_failed').length;
  const policyBlocks30 = audit30.filter((record) => record.decision === 'blocked').length;
  const costSnapshot = audit.find((record) => record.action === 'growth.cost_snapshot');

  const acquisitionSpendCents = centsFromMetadata(costSnapshot?.metadata, 'acquisitionSpendCents');
  const fulfillmentLaborCents = centsFromMetadata(costSnapshot?.metadata, 'fulfillmentLaborCents');
  const softwareAiCents = centsFromMetadata(costSnapshot?.metadata, 'softwareAiCents');
  const totalCostCents = acquisitionSpendCents + fulfillmentLaborCents + softwareAiCents;

  const realInvoices = invoices.filter((invoice) => realClientIds.has(invoice.clientId));
  const paid30 = realInvoices.filter((invoice) => invoice.status === 'paid' && within30(invoice.paidAt));
  const collected30Cents = paid30.reduce((sum, invoice) => sum + invoice.amountCents, 0);
  const eligiblePipelineCents = realInvoices
    .filter((invoice) => ['open', 'checkout_pending'].includes(invoice.status) && invoice.eligibilityDecision === 'eligible')
    .reduce((sum, invoice) => sum + invoice.amountCents, 0);
  const gatedInvoices30 = realInvoices.filter((invoice) => within30(invoice.createdAt) && invoice.eligibilityDecision !== 'eligible').length;
  const paidWithoutEligibility = realInvoices.filter((invoice) => invoice.status === 'paid' && invoice.eligibilityDecision !== 'eligible').length;

  const b2bLatest = new Map<string, (typeof realInvoices)[number]>();
  for (const invoice of realInvoices) {
    if (invoice.status === 'void') continue;
    const service = getCommercialService(invoice.serviceId);
    if (!service || service.audience !== 'b2b' || service.billingModel !== 'monthly') continue;
    const key = `${invoice.clientId}:${invoice.serviceId}`;
    if (!b2bLatest.has(key)) b2bLatest.set(key, invoice);
  }
  const b2bMrrProxyCents = [...b2bLatest.values()].reduce((sum, invoice) => sum + invoice.amountCents, 0);

  const leadActivationRatio = leads30.length ? (activated30 / leads30.length) * 100 : null;
  const cacCents = costSnapshot && activated30 > 0 ? acquisitionSpendCents / activated30 : null;
  const contributionProfitCents = costSnapshot ? collected30Cents - totalCostCents : null;
  const contributionMargin = contributionProfitCents != null && collected30Cents > 0
    ? (contributionProfitCents / collected30Cents) * 100
    : null;

  const gates: { label: string; status: GateStatus; evidence: string }[] = [
    {
      label: 'Demand',
      status: leads30.length >= 5 ? 'pass' : 'incomplete',
      evidence: `${leads30.length} delivered qualified lead${leads30.length === 1 ? '' : 's'} in trailing 30 days`
    },
    {
      label: 'Activation',
      status: activated30 > 0 ? 'pass' : 'incomplete',
      evidence: `${activated30} real client activation${activated30 === 1 ? '' : 's'} in trailing 30 days`
    },
    {
      label: 'Collected revenue',
      status: collected30Cents > 0 ? 'pass' : 'incomplete',
      evidence: `${dollars(collected30Cents / 100)} processor-verified paid invoices in trailing 30 days`
    },
    {
      label: 'Profitability',
      status: contributionProfitCents == null || collected30Cents === 0 ? 'incomplete' : contributionProfitCents > 0 ? 'pass' : 'fail',
      evidence: costSnapshot ? `${dollars((contributionProfitCents || 0) / 100)} contribution after recorded 30-day acquisition, labor and software/AI costs` : 'No 30-day cost snapshot recorded yet'
    },
    {
      label: 'Recurring revenue',
      status: b2bMrrProxyCents > 0 ? 'pass' : 'incomplete',
      evidence: `${dollars(b2bMrrProxyCents / 100)} B2B monthly-service invoice run-rate proxy`
    },
    {
      label: 'Settlement compliance',
      status: paidWithoutEligibility === 0 ? 'pass' : 'fail',
      evidence: paidWithoutEligibility === 0 ? '0 paid real invoices bypassed billing eligibility' : `${paidWithoutEligibility} paid invoice(s) require immediate compliance review`
    }
  ];
  const proofScore = gates.filter((gate) => gate.status === 'pass').length;
  const failedProof = gates.some((gate) => gate.status === 'fail');

  return (
    <main>
      <header className="appHeader">
        <div>
          <div className="kicker">CREDIT REPAIR MASTERS / REVENUE PROOF OS / v4.5</div>
          <h1>Prove demand, margin, recurrence and compliance.</h1>
          <p className="subtitle">This control plane uses real tenant clients, PII-minimized lead events, billing invoices, payment settlement state, operating cost snapshots and policy decisions. Missing evidence stays INCOMPLETE; forecasts never count as revenue.</p>
        </div>
        <div className="headerActions"><Link className="primaryButton" href="/get-started">Public funnel</Link><Link className="secondaryButton" href="/billing">Billing</Link><Link className="secondaryButton" href="/dashboard">Owner OS</Link></div>
      </header>

      <section className="grid">
        <div className="card span3"><div className="label">Revenue proof</div><div className="value">{proofScore}/6</div><div className="small">{failedProof ? 'one or more gates failed' : proofScore === 6 ? 'all commercial proof gates passed' : 'live evidence still accumulating'}</div></div>
        <div className="card span3"><div className="label">Qualified leads · 30d</div><div className="value">{leads30.length}</div><div className="small">{leadDeliveryFailures30} delivery failures · PII minimized in ledger</div></div>
        <div className="card span3"><div className="label">Collected · 30d</div><div className="value">{dollars(collected30Cents / 100)}</div><div className="small">{paid30.length} processor-verified real paid invoice{paid30.length === 1 ? '' : 's'}</div></div>
        <div className="card span3"><div className="label">Contribution margin</div><div className="value">{percent(contributionMargin)}</div><div className="small">{costSnapshot ? `latest cost evidence ${new Date(costSnapshot.createdAt).toLocaleDateString()}` : 'record cost evidence below'}</div></div>

        <div className="card span12">
          <div className="label">Commercial proof gates</div>
          <h2>No declaration of product-market fit without evidence.</h2>
          <div className="grid">
            {gates.map((gate) => (
              <div className="card span4" key={gate.label}>
                <div className="row"><strong>{gate.label}</strong><span className={`pill ${gateClass(gate.status)}`}>{gate.status}</span></div>
                <p className="small">{gate.evidence}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card span6">
          <div className="label">Actual funnel · trailing 30 days</div>
          <h2>Lead → activation → collection</h2>
          <div className="listRow"><span>Delivered qualification requests</span><strong>{leads30.length}</strong></div>
          <div className="listRow"><span>Real clients created</span><strong>{activated30}</strong></div>
          <div className="listRow"><span>Activation / lead ratio</span><strong>{percent(leadActivationRatio)}</strong></div>
          <div className="listRow"><span>Collected revenue</span><strong>{dollars(collected30Cents / 100)}</strong></div>
          <div className="listRow"><span>Eligible open pipeline</span><strong>{dollars(eligiblePipelineCents / 100)}</strong></div>
          <div className="small" style={{ marginTop: 12 }}>The activation/lead ratio is an operating proxy, not strict attribution: manually created clients or leads from other channels can affect it.</div>
        </div>

        <div className="card span6">
          <div className="label">Unit economics · trailing 30 days</div>
          <h2>Profitability from recorded costs</h2>
          <div className="listRow"><span>Acquisition spend</span><strong>{costSnapshot ? dollars(acquisitionSpendCents / 100) : '—'}</strong></div>
          <div className="listRow"><span>Fulfillment labor</span><strong>{costSnapshot ? dollars(fulfillmentLaborCents / 100) : '—'}</strong></div>
          <div className="listRow"><span>Software + AI</span><strong>{costSnapshot ? dollars(softwareAiCents / 100) : '—'}</strong></div>
          <div className="listRow"><span>Blended CAC</span><strong>{cacCents == null ? '—' : dollars(cacCents / 100)}</strong></div>
          <div className="listRow"><span>Contribution profit</span><strong>{contributionProfitCents == null ? '—' : dollars(contributionProfitCents / 100)}</strong></div>
          <div className="listRow"><span>Contribution margin</span><strong>{percent(contributionMargin)}</strong></div>
        </div>

        <div className="card span7">
          <div className="label">Cost evidence</div>
          <h2>Record the costs required to earn the revenue.</h2>
          <GrowthCostForm />
        </div>

        <div className="card span5">
          <div className="label">Recurring revenue evidence</div>
          <h2>B2B monthly run-rate proxy</h2>
          <div className="value">{dollars(b2bMrrProxyCents / 100)}</div>
          <p className="small">Uses the latest non-void monthly B2B invoice per client/service. This is deliberately labeled a proxy until subscription lifecycle state is represented directly.</p>
          <div className="listRow"><span>Real clients total</span><strong>{realClients.length}</strong></div>
          <div className="listRow"><span>Active</span><strong>{active}</strong></div>
          <div className="listRow"><span>Onboarding</span><strong>{onboarding}</strong></div>
          <div className="listRow"><span>Agent reliability</span><strong>{runSuccess}%</strong></div>
        </div>

        <div className="card span6">
          <div className="label">Compliance economics</div>
          <h2>Revenue must survive the policy gates.</h2>
          <div className="listRow"><span>Paid invoices without eligibility</span><strong className={paidWithoutEligibility ? 'high' : ''}>{paidWithoutEligibility}</strong></div>
          <div className="listRow"><span>Non-eligible invoice decisions · 30d</span><strong>{gatedInvoices30}</strong></div>
          <div className="listRow"><span>Policy blocks enforced · ledger 30d</span><strong>{policyBlocks30}</strong></div>
          <div className="listRow"><span>Production controls</span><strong>{productionReadiness.summary.percent}%</strong></div>
          <div className="guardrail" style={{ marginTop: 12 }}>A blocked action is evidence that the fail-closed controls are working; it is not automatically a compliance incident. Any paid invoice that bypasses eligibility is treated as a failed proof gate.</div>
        </div>

        <div className="card span6">
          <div className="label">Next commercial threshold</div>
          <h2>What changes “experiment” into “repeatable business”</h2>
          <div className="listRow"><span>Qualified leads / 30d</span><strong>50+</strong></div>
          <div className="listRow"><span>Lead → activation</span><strong>20%+</strong></div>
          <div className="listRow"><span>Contribution margin</span><strong>&gt;60% B2C</strong></div>
          <div className="listRow"><span>B2B monthly run-rate</span><strong>$3K+</strong></div>
          <div className="listRow"><span>Paid invoices bypassing eligibility</span><strong>0</strong></div>
          <div className="small" style={{ marginTop: 12 }}>These are operating thresholds, not guarantees. Scale only after the live evidence stays positive across multiple cohorts.</div>
        </div>
      </section>
    </main>
  );
}
