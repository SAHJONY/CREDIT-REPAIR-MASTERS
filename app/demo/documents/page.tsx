import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SignOutButton } from '@/components/sign-out-button';
import { getBusinessSession } from '@/lib/session-access';

export const dynamic = 'force-dynamic';

type DemoDocument = {
  category: string;
  name: string;
  use: string;
  status: 'sample' | 'approval required' | 'post-performance';
};

const documents: DemoDocument[] = [
  { category: 'Client intake', name: 'Consumer Intake Form — SAMPLE', use: 'Basic profile, goals, current credit concerns, communication preferences, and state.', status: 'sample' },
  { category: 'Client intake', name: 'Business Intake Form — SAMPLE', use: 'Entity profile, EIN placeholder, industry, banking readiness, vendor history, and funding goals.', status: 'sample' },
  { category: 'Identity', name: 'Government ID Placeholder — SAMPLE', use: 'Demonstrates identity-document evidence without storing real PII.', status: 'sample' },
  { category: 'Identity', name: 'Proof of Address Placeholder — SAMPLE', use: 'Demonstrates address-verification evidence for onboarding.', status: 'sample' },
  { category: 'Consent', name: 'Credit Report Analysis Authorization — SAMPLE', use: 'Documents client authorization before credit-report analysis.', status: 'sample' },
  { category: 'Consent', name: 'Dispute Drafting Authorization — SAMPLE', use: 'Demonstrates authorization to prepare draft dispute materials.', status: 'sample' },
  { category: 'Consent', name: 'Dispute Submission Approval — SAMPLE', use: 'Owner/client approval gate before any external dispute submission.', status: 'approval required' },
  { category: 'Agreement', name: 'Credit Services Agreement — SAMPLE', use: 'Illustrates contracted scope, disclosures, cancellation language, and post-performance billing terms.', status: 'sample' },
  { category: 'Agreement', name: 'Business Credit Accelerator Agreement — SAMPLE', use: 'Illustrates business-credit service scope, milestones, and exclusions.', status: 'sample' },
  { category: 'Credit reports', name: 'Three-Bureau Credit Report — SAMPLE', use: 'Synthetic credit-report example for analysis demonstrations.', status: 'sample' },
  { category: 'Credit reports', name: 'Specialty CRA Disclosure — SAMPLE', use: 'Synthetic specialty consumer-report example for targeted workflows.', status: 'sample' },
  { category: 'Analysis', name: 'Credit Intelligence Audit — SAMPLE', use: 'Example findings, inconsistencies, risk flags, and recommended next actions.', status: 'sample' },
  { category: 'Analysis', name: 'Account Prioritization Matrix — SAMPLE', use: 'Example prioritization of items for factual review and documentation collection.', status: 'sample' },
  { category: 'Disputes', name: 'Credit Bureau Dispute Letter — SAMPLE', use: 'Example draft requesting investigation of specifically identified information.', status: 'approval required' },
  { category: 'Disputes', name: 'Furnisher Direct Dispute Letter — SAMPLE', use: 'Example draft to an information furnisher with evidence references.', status: 'approval required' },
  { category: 'Disputes', name: 'Debt Collector Validation Request — SAMPLE', use: 'Example correspondence requesting validation/documentation where applicable.', status: 'approval required' },
  { category: 'Disputes', name: 'Identity Theft Documentation Checklist — SAMPLE', use: 'Example workflow checklist; does not create or submit an identity-theft report.', status: 'approval required' },
  { category: 'Evidence', name: 'Supporting Evidence Index — SAMPLE', use: 'Maps each disputed item to statements, correspondence, payment records, and identity evidence.', status: 'sample' },
  { category: 'Evidence', name: 'Payment Record — SAMPLE', use: 'Synthetic payment-history evidence for demonstration only.', status: 'sample' },
  { category: 'Evidence', name: 'Creditor Correspondence — SAMPLE', use: 'Synthetic letter/email evidence linked to a demo case.', status: 'sample' },
  { category: 'Compliance', name: 'Compliance Review Checklist — SAMPLE', use: 'Shows consent, state overlay, cancellation window, and action-gate review.', status: 'approval required' },
  { category: 'Compliance', name: 'Owner Approval Record — SAMPLE', use: 'Demonstrates approval-required actions before external execution.', status: 'approval required' },
  { category: 'Milestones', name: 'Completed Service Milestone Certificate — SAMPLE', use: 'Documents a completed contracted milestone before billing eligibility is evaluated.', status: 'post-performance' },
  { category: 'Billing', name: 'Invoice — SAMPLE', use: 'Example post-performance invoice tied to an approved milestone.', status: 'post-performance' },
  { category: 'Billing', name: 'Payment Receipt — SAMPLE', use: 'Example receipt structure; real receipts are created only after processor-verified settlement.', status: 'post-performance' },
  { category: 'Billing', name: 'Refund/Void Record — SAMPLE', use: 'Illustrates non-destructive accounting history for voided or refunded transactions.', status: 'post-performance' },
  { category: 'Business credit', name: 'Business Entity Readiness Checklist — SAMPLE', use: 'Entity consistency, address, phone, licenses, domain, banking, and records readiness.', status: 'sample' },
  { category: 'Business credit', name: 'Business Banking Readiness Review — SAMPLE', use: 'Example review of business banking setup and documentation readiness.', status: 'sample' },
  { category: 'Business credit', name: 'Vendor Tradeline Tracker — SAMPLE', use: 'Synthetic vendor accounts, reporting status, terms, and payment-history tracking.', status: 'sample' },
  { category: 'Business credit', name: 'Business Credit Strategy — SAMPLE', use: 'Example phased roadmap for profile readiness, tradelines, monitoring, and funding preparation.', status: 'sample' },
  { category: 'Business credit', name: 'Funding Readiness Summary — SAMPLE', use: 'Demonstrates readiness indicators without promising approval or financing outcomes.', status: 'sample' },
  { category: 'Operations', name: 'Client Progress Report — SAMPLE', use: 'Example customer-facing summary of completed work, open tasks, evidence, and next approvals.', status: 'sample' },
  { category: 'Operations', name: 'Case Audit Export — SAMPLE', use: 'Example chronological log of consent, evidence, AI runs, approvals, billing, and settlement events.', status: 'sample' }
];

export default async function DemoDocumentsPage() {
  const session = await getBusinessSession();
  if (!session) redirect('/auth/sign-in');
  if (session.mfaRequired && !session.mfaAssured) redirect('/auth/mfa');

  const categories = Array.from(new Set(documents.map((document) => document.category)));

  return (
    <main>
      <header className="appHeader">
        <div>
          <div className="kicker">CREDIT REPAIR MASTERS / DEMO DOCUMENTS</div>
          <h1>Document Examples Library</h1>
          <p className="subtitle">Synthetic examples for training, sales demos, QA, and workflow validation. No document on this page is a real customer record or proof of a completed legal/compliance action.</p>
        </div>
        <div className="headerActions">
          <Link className="secondaryButton" href="/demo">Demo OS</Link>
          <Link className="secondaryButton" href="/dashboard">Dashboard</Link>
          <SignOutButton />
        </div>
      </header>

      <section className="grid">
        <div className="card span12">
          <div className="label">Coverage</div>
          <h2>{documents.length} sample documents across {categories.length} workflow categories</h2>
          <div className="guardrail">All examples must remain visibly marked SAMPLE/DEMO. They cannot be used as evidence that a customer signed, paid, authorized, disputed, or completed a service.</div>
        </div>

        {categories.map((category) => (
          <div className="card span6" key={category}>
            <div className="label">{category}</div>
            <h2>Example documents</h2>
            {documents.filter((document) => document.category === category).map((document) => (
              <div className="listRow" key={document.name}>
                <div>
                  <strong>{document.name}</strong>
                  <div className="small">{document.use}</div>
                </div>
                <span className={`pill ${document.status === 'approval required' ? 'medium' : document.status === 'post-performance' ? 'low' : 'medium'}`}>{document.status}</span>
              </div>
            ))}
          </div>
        ))}
      </section>
    </main>
  );
}
