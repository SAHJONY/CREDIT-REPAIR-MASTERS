import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SignOutButton } from '@/components/sign-out-button';
import { getBusinessSession } from '@/lib/session-access';
import { stateComplianceRules, stateComplianceRuntimeSummary } from '@/lib/state-compliance';

export const dynamic = 'force-dynamic';

export default async function NationwideCompliancePage() {
  const session = await getBusinessSession();
  if (!session) redirect('/auth/sign-in');
  if (session.mfaRequired && !session.mfaAssured) redirect('/auth/mfa');

  const summary = stateComplianceRuntimeSummary();
  const rules = Object.values(stateComplianceRules).sort((a, b) => a.name.localeCompare(b.name));

  return <main>
    <header className="appHeader">
      <div><div className="kicker">CREDIT REPAIR MASTERS / NATIONWIDE COMPLIANCE</div><h1>Nationwide Automation Control Plane</h1><p className="subtitle">Versioned jurisdiction rules determine when contracts, billing, communications, and external actions may run autonomously.</p></div>
      <div className="headerActions"><Link className="secondaryButton" href="/dashboard">Dashboard</Link><Link className="secondaryButton" href="/billing">Billing</Link><SignOutButton /></div>
    </header>

    <section className="grid">
      <div className="card span3"><div className="label">Jurisdictions</div><div className="value">{summary.jurisdictions}</div><div className="small">50 states + DC</div></div>
      <div className="card span3"><div className="label">Autonomous</div><div className="value">{summary.validated}</div><div className="small">official-source rule bundles verified</div></div>
      <div className="card span3"><div className="label">Automation</div><div className="value">{summary.automationPercent}%</div><div className="small">consequential-action coverage</div></div>
      <div className="card span3"><div className="label">Policy</div><div className="value statusValue">FAIL CLOSED</div><div className="small">unverified rules never auto-approve</div></div>

      <div className="card span12">
        <div className="label">Ruleset</div><h2>{summary.version}</h2>
        <div className="guardrail">Intake, evidence, analysis, document storage, and internal workflow can operate nationwide. Billing and consequential external actions become autonomous only when the jurisdiction rule bundle is verified against authoritative law. Telemarketing remains subject to its separate federal TSR gate.</div>
      </div>

      <div className="card span12">
        <div className="label">Jurisdiction matrix</div><h2>State-by-state automation status</h2>
        {rules.map((rule) => <div className="listRow" key={rule.jurisdiction}>
          <div><strong>{rule.name} ({rule.jurisdiction})</strong><div className="small">{rule.mode === 'validated' ? `${rule.cancellationDays ?? 'Statutory'}-day cancellation · ${rule.advanceFeePolicy.replaceAll('_', ' ')} · registration ${rule.registrationPolicy} · bond ${rule.bondPolicy}` : 'Federal baseline active · state overlay verification pending'}</div></div>
          <span className={`pill ${rule.mode === 'validated' ? 'low' : rule.mode === 'blocked' ? 'high' : 'medium'}`}>{rule.mode === 'validated' ? 'AUTONOMOUS' : rule.mode === 'blocked' ? 'BLOCKED' : 'VERIFY'}</span>
        </div>)}
      </div>
    </section>
  </main>;
}
