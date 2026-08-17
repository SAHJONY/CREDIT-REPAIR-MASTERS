export type DemoDocumentStatus = 'sample' | 'approval required' | 'post-performance';

export type DemoDocumentSection = {
  heading: string;
  lines: string[];
};

export type DemoDocument = {
  slug: string;
  category: string;
  name: string;
  use: string;
  status: DemoDocumentStatus;
  sections: DemoDocumentSection[];
};

const sampleIdentity = [
  'Customer name: DEMO — Sample Customer',
  'Address: 100 Demo Avenue, Sample City, FL 33101',
  'Email: demo.customer@example.com',
  'Phone: (305) 555-0100',
  'Date: August 16, 2026'
];

export const demoDocuments: DemoDocument[] = [
  {
    slug: 'consumer-intake-form', category: 'Client intake', name: 'Consumer Intake Form — SAMPLE', status: 'sample',
    use: 'Basic profile, goals, current credit concerns, communication preferences, and state.',
    sections: [
      { heading: 'Customer profile', lines: sampleIdentity },
      { heading: 'Goals', lines: ['Primary goal: Improve factual accuracy of consumer reports and understand current credit profile.', 'Target timeline: 90–180 days for review cycles; no score outcome promised.', 'Preferred communication: Email and customer portal.'] },
      { heading: 'Current concerns', lines: ['Potential inaccurate late payment reporting.', 'Possible duplicate collection entry.', 'Address history requires review.', 'Customer will obtain reports directly from authorized consumer disclosure sources.'] },
      { heading: 'Acknowledgment', lines: ['This SAMPLE intake is for demonstration only.', 'No dispute, deletion, score increase, or financing outcome is guaranteed.'] }
    ]
  },
  {
    slug: 'business-intake-form', category: 'Client intake', name: 'Business Intake Form — SAMPLE', status: 'sample',
    use: 'Entity profile, EIN placeholder, industry, banking readiness, vendor history, and funding goals.',
    sections: [
      { heading: 'Business profile', lines: ['Legal entity: DEMO ENTERPRISE LLC', 'State: Florida', 'EIN: XX-XXX1234 (synthetic)', 'Industry: Professional services', 'Years in business: 2'] },
      { heading: 'Operating readiness', lines: ['Business bank account: Open', 'Business domain/email: Active', 'Licenses: Review required by industry', 'Vendor accounts: 2 synthetic examples'] },
      { heading: 'Goals', lines: ['Build a consistent business credit profile.', 'Establish reporting vendor relationships where commercially appropriate.', 'Prepare documentation for future funding review without promising approval.'] }
    ]
  },
  {
    slug: 'government-id-placeholder', category: 'Identity', name: 'Government ID Placeholder — SAMPLE', status: 'sample',
    use: 'Demonstrates identity-document evidence without storing real PII.',
    sections: [{ heading: 'Identity evidence', lines: ['Document type: Driver License — DEMO ONLY', 'Name: SAMPLE CUSTOMER', 'Document number: REDACTED-DEMO-001', 'Expiration: 12/31/2030', 'Verification state: SAMPLE / NOT VERIFIED'] }, { heading: 'Security note', lines: ['Real identity documents belong only in the private evidence vault.', 'Never store full government ID numbers in logs, analytics, or demo fixtures.'] }]
  },
  {
    slug: 'proof-of-address-placeholder', category: 'Identity', name: 'Proof of Address Placeholder — SAMPLE', status: 'sample',
    use: 'Demonstrates address-verification evidence for onboarding.',
    sections: [{ heading: 'Address evidence', lines: ['Document: Utility statement — synthetic', 'Customer: DEMO — Sample Customer', 'Service address: 100 Demo Avenue, Sample City, FL 33101', 'Statement date: August 2026', 'Account number: REDACTED'] }, { heading: 'Review', lines: ['Address matches demo intake profile.', 'Production evidence requires vault storage and reviewer verification.'] }]
  },
  {
    slug: 'credit-report-analysis-authorization', category: 'Consent', name: 'Credit Report Analysis Authorization — SAMPLE', status: 'sample',
    use: 'Documents client authorization before credit-report analysis.',
    sections: [{ heading: 'Authorization', lines: ['I authorize CREDIT REPAIR MASTERS to review consumer report information that I voluntarily provide for the purpose of identifying factual inconsistencies, documenting concerns, and preparing recommendations.', 'This authorization does not permit impersonation, credential sharing, or unauthorized access to bureau systems.'] }, { heading: 'Scope', lines: ['Review uploaded consumer reports.', 'Organize factual issues and supporting evidence.', 'Prepare analysis and draft correspondence for approval where applicable.'] }, { heading: 'Signature', lines: ['Customer signature: ____________________', 'Date: ____________________', 'SAMPLE — NOT EXECUTED'] }]
  },
  {
    slug: 'dispute-drafting-authorization', category: 'Consent', name: 'Dispute Drafting Authorization — SAMPLE', status: 'sample',
    use: 'Demonstrates authorization to prepare draft dispute materials.',
    sections: [{ heading: 'Authorization', lines: ['Customer authorizes preparation of draft dispute correspondence based on customer-identified facts and supplied evidence.', 'Drafting does not equal submission.'] }, { heading: 'Limits', lines: ['No false statements.', 'No invented identity theft claims.', 'No external submission without the required approval gate.'] }, { heading: 'Signature', lines: ['Customer: ____________________', 'Date: ____________________', 'SAMPLE — NOT EXECUTED'] }]
  },
  {
    slug: 'dispute-submission-approval', category: 'Consent', name: 'Dispute Submission Approval — SAMPLE', status: 'approval required',
    use: 'Owner/client approval gate before any external dispute submission.',
    sections: [{ heading: 'Approval decision', lines: ['Draft reviewed: YES / NO', 'Evidence reviewed: YES / NO', 'Customer factual assertions confirmed: YES / NO', 'State/compliance review complete: YES / NO'] }, { heading: 'Decision', lines: ['Approved for submission: YES / NO', 'Approver: ____________________', 'Date/time: ____________________', 'SAMPLE — NO EXTERNAL ACTION TAKEN'] }]
  },
  {
    slug: 'credit-services-agreement', category: 'Agreement', name: 'Credit Services Agreement — SAMPLE', status: 'sample',
    use: 'Illustrates contracted scope, disclosures, cancellation language, and post-performance billing terms.',
    sections: [{ heading: 'Parties', lines: ['Provider: CREDIT REPAIR MASTERS', 'Customer: DEMO — Sample Customer', 'Effective date: August 16, 2026'] }, { heading: 'Scope of services', lines: ['Credit intelligence audit.', 'Evidence organization.', 'Draft correspondence and strategy support.', 'Progress reporting and compliance-controlled workflow.'] }, { heading: 'Billing', lines: ['No charge is issued until a contracted milestone is completed and the billing compliance gate confirms collection is permitted.', 'No guarantee of deletions, score increases, approvals, or financing.'] }, { heading: 'Cancellation / disclosures', lines: ['Applicable cancellation rights and state-specific notices must be supplied in production.', 'This sample is not legal advice and is not an executed agreement.'] }, { heading: 'Signatures', lines: ['Customer: ____________________', 'Provider: ____________________', 'SAMPLE — NOT EXECUTED'] }]
  },
  {
    slug: 'business-credit-accelerator-agreement', category: 'Agreement', name: 'Business Credit Accelerator Agreement — SAMPLE', status: 'sample',
    use: 'Illustrates business-credit service scope, milestones, and exclusions.',
    sections: [{ heading: 'Service scope', lines: ['Entity readiness review.', 'Business identity consistency review.', 'Vendor/tradeline strategy.', 'Banking and funding-readiness documentation.', 'Progress reporting.'] }, { heading: 'Exclusions', lines: ['No guarantee of approvals, credit limits, funding amounts, or reporting by any vendor.', 'No creation of false trade history or fabricated revenue.'] }, { heading: 'Milestone billing', lines: ['Example milestone: Business Credit Accelerator implementation plan completed and delivered.', 'Price example: $799 after eligibility gate approval.'] }]
  },
  {
    slug: 'three-bureau-credit-report', category: 'Credit reports', name: 'Three-Bureau Credit Report — SAMPLE', status: 'sample',
    use: 'Synthetic credit-report example for analysis demonstrations.',
    sections: [{ heading: 'Profile summary', lines: ['Equifax synthetic file: 8 accounts', 'Experian synthetic file: 9 accounts', 'TransUnion synthetic file: 8 accounts', 'Scores intentionally omitted; this is not a real report.'] }, { heading: 'Synthetic tradelines', lines: ['DEMO BANKCARD 001 — current — $1,200 balance.', 'DEMO AUTO 002 — closed — one disputed late marker.', 'DEMO COLLECTION 003 — collection — possible duplicate reference.'] }, { heading: 'Review flags', lines: ['Date-of-first-delinquency consistency check.', 'Duplicate collection identifiers.', 'Address/name variations.', 'Payment status consistency across bureaus.'] }]
  },
  {
    slug: 'specialty-cra-disclosure', category: 'Credit reports', name: 'Specialty CRA Disclosure — SAMPLE', status: 'sample',
    use: 'Synthetic specialty consumer-report example for targeted workflows.',
    sections: [{ heading: 'Disclosure', lines: ['Provider: SAMPLE SPECIALTY CRA', 'File date: August 2026', 'Identity risk records: 1 synthetic record', 'Check-risk records: 2 synthetic records'] }, { heading: 'Review notes', lines: ['Validate identity match before any action.', 'Use official consumer disclosure/dispute channels only.', 'No scraping or bypass of authentication.'] }]
  },
  {
    slug: 'credit-intelligence-audit', category: 'Analysis', name: 'Credit Intelligence Audit — SAMPLE', status: 'sample',
    use: 'Example findings, inconsistencies, risk flags, and recommended next actions.',
    sections: [{ heading: 'Executive findings', lines: ['3 factual items require documentation review.', '1 possible duplicate collection identifier.', '2 profile fields show cross-bureau inconsistency.'] }, { heading: 'Priority actions', lines: ['Collect statements and creditor correspondence.', 'Confirm account ownership and dates.', 'Prepare factual dispute drafts only where evidence supports the assertion.'] }, { heading: 'Risk controls', lines: ['No blanket disputes.', 'No unsupported legal claims.', 'All external actions require required approvals.'] }]
  },
  {
    slug: 'account-prioritization-matrix', category: 'Analysis', name: 'Account Prioritization Matrix — SAMPLE', status: 'sample',
    use: 'Example prioritization of items for factual review and documentation collection.',
    sections: [{ heading: 'Priority 1', lines: ['DEMO COLLECTION 003 — possible duplicate — evidence strength: medium — next: obtain statements and collector correspondence.'] }, { heading: 'Priority 2', lines: ['DEMO AUTO 002 — late marker discrepancy — evidence strength: high — next: compare statements/payment confirmations.'] }, { heading: 'Priority 3', lines: ['Profile address variation — evidence strength: high — next: identity/address documentation.'] }]
  },
  {
    slug: 'credit-bureau-dispute-letter', category: 'Disputes', name: 'Credit Bureau Dispute Letter — SAMPLE', status: 'approval required',
    use: 'Example draft requesting investigation of specifically identified information.',
    sections: [{ heading: 'Draft letter', lines: ['To: SAMPLE CREDIT BUREAU', 'Re: Request for investigation of specifically identified information', '', 'I am requesting an investigation of the following item because the information appears inconsistent with the records I have attached.', 'Account: DEMO AUTO 002', 'Specific issue: Payment status for May 2026 is reported late, while the attached synthetic payment confirmation shows an on-time payment.', '', 'Please investigate and provide the results of your reinvestigation using the contact information in my file.'] }, { heading: 'Attachments', lines: ['Synthetic statement.', 'Synthetic payment confirmation.', 'Identity/address placeholders.'] }, { heading: 'Control', lines: ['DRAFT ONLY — requires customer/owner approval before submission.'] }]
  },
  {
    slug: 'furnisher-direct-dispute-letter', category: 'Disputes', name: 'Furnisher Direct Dispute Letter — SAMPLE', status: 'approval required',
    use: 'Example draft to an information furnisher with evidence references.',
    sections: [{ heading: 'Draft letter', lines: ['To: DEMO AUTO FINANCE', 'Re: Direct dispute of payment-history information', 'I dispute the accuracy of the May 2026 late-payment notation. The enclosed sample records indicate payment was received by the due date. Please investigate the specifically disputed information and report the results.'] }, { heading: 'Evidence references', lines: ['Exhibit A — synthetic bank confirmation.', 'Exhibit B — synthetic account statement.'] }, { heading: 'Control', lines: ['DRAFT ONLY — no external submission occurred.'] }]
  },
  {
    slug: 'debt-collector-validation-request', category: 'Disputes', name: 'Debt Collector Validation Request — SAMPLE', status: 'approval required',
    use: 'Example correspondence requesting validation/documentation where applicable.',
    sections: [{ heading: 'Draft request', lines: ['To: SAMPLE COLLECTION AGENCY', 'Re: DEMO COLLECTION 003', 'Please provide information sufficient to identify the account, original creditor, amount claimed, and documentation supporting your authority to collect and report this account, as applicable.'] }, { heading: 'Notes', lines: ['Use only when factually and legally appropriate.', 'This sample is not a claim that the debt is invalid.'] }]
  },
  {
    slug: 'identity-theft-documentation-checklist', category: 'Disputes', name: 'Identity Theft Documentation Checklist — SAMPLE', status: 'approval required',
    use: 'Example workflow checklist; does not create or submit an identity-theft report.',
    sections: [{ heading: 'Checklist', lines: ['Customer alleges identity theft based on true facts: YES / NO', 'Government identity theft report obtained by customer: YES / NO', 'Government ID evidence: YES / NO', 'Proof of address: YES / NO', 'Account-specific documentation: YES / NO'] }, { heading: 'Guardrail', lines: ['Never characterize a debt or account as identity theft unless the customer truthfully reports it and required evidence exists.', 'SAMPLE — no identity-theft report created.'] }]
  },
  {
    slug: 'supporting-evidence-index', category: 'Evidence', name: 'Supporting Evidence Index — SAMPLE', status: 'sample',
    use: 'Maps each disputed item to statements, correspondence, payment records, and identity evidence.',
    sections: [{ heading: 'Index', lines: ['E-001 — Government ID placeholder — identity.', 'E-002 — Proof of address placeholder — identity/address.', 'E-003 — Synthetic account statement — DEMO AUTO 002.', 'E-004 — Synthetic payment confirmation — DEMO AUTO 002.', 'E-005 — Synthetic collector letter — DEMO COLLECTION 003.'] }]
  },
  {
    slug: 'payment-record', category: 'Evidence', name: 'Payment Record — SAMPLE', status: 'sample',
    use: 'Synthetic payment-history evidence for demonstration only.',
    sections: [{ heading: 'Payment record', lines: ['Account: DEMO AUTO 002', 'Due date: May 15, 2026', 'Payment date: May 13, 2026', 'Amount: $425.00', 'Reference: SAMPLE-PMT-2026-0513', 'Status: Synthetic / not a real transaction'] }]
  },
  {
    slug: 'creditor-correspondence', category: 'Evidence', name: 'Creditor Correspondence — SAMPLE', status: 'sample',
    use: 'Synthetic letter/email evidence linked to a demo case.',
    sections: [{ heading: 'Correspondence', lines: ['From: Demo Auto Finance', 'To: DEMO — Sample Customer', 'Subject: Payment history inquiry', 'Message: Our records show receipt of a payment on May 13, 2026. This synthetic correspondence is provided solely for workflow demonstration.'] }]
  },
  {
    slug: 'compliance-review-checklist', category: 'Compliance', name: 'Compliance Review Checklist — SAMPLE', status: 'approval required',
    use: 'Shows consent, state overlay, cancellation window, and action-gate review.',
    sections: [{ heading: 'Required checks', lines: ['Identity/tenant match confirmed.', 'Active consent confirmed.', 'Applicable state overlay reviewed.', 'Cancellation window evaluated where applicable.', 'Evidence supports factual assertion.', 'No prohibited guarantee language.', 'External action requires approval when configured.'] }, { heading: 'Decision', lines: ['Result: APPROVE / HOLD / BLOCK', 'Reviewer: ____________________', 'Reason: ____________________'] }]
  },
  {
    slug: 'owner-approval-record', category: 'Compliance', name: 'Owner Approval Record — SAMPLE', status: 'approval required',
    use: 'Demonstrates approval-required actions before external execution.',
    sections: [{ heading: 'Approval', lines: ['Action: Submit specifically identified dispute correspondence.', 'Client: DEMO — Sample Customer', 'Evidence reviewed: YES', 'Compliance gate: PASS', 'Owner decision: APPROVE / REJECT', 'Owner signature: ____________________', 'Timestamp: ____________________'] }]
  },
  {
    slug: 'completed-service-milestone-certificate', category: 'Milestones', name: 'Completed Service Milestone Certificate — SAMPLE', status: 'post-performance',
    use: 'Documents a completed contracted milestone before billing eligibility is evaluated.',
    sections: [{ heading: 'Milestone', lines: ['Customer: DEMO — Billing Demo', 'Service: Complete Credit Intelligence Audit', 'Completed deliverable: Written credit intelligence audit delivered in customer workspace.', 'Completion date: August 16, 2026'] }, { heading: 'Billing gate inputs', lines: ['Contract signed: YES — sample', 'Service/milestone completed: YES — sample', 'Applicable cancellation window expired: YES — sample', 'State workflow: DEMO PASS'] }, { heading: 'Control', lines: ['This certificate alone does not create a payable invoice; the billing gate must approve collection.'] }]
  },
  {
    slug: 'invoice', category: 'Billing', name: 'Invoice — SAMPLE', status: 'post-performance',
    use: 'Example post-performance invoice tied to an approved milestone.',
    sections: [{ heading: 'Invoice', lines: ['Invoice ID: INV-DEMO-0001', 'Customer: DEMO — Billing Demo', 'Service: Complete Credit Intelligence Audit', 'Milestone: Audit delivered', 'Amount due: $199.00', 'Status: OPEN — SAMPLE'] }, { heading: 'Payment', lines: ['Payment must be completed through the authenticated customer portal and processor checkout.', 'Browser redirects do not mark invoices paid.'] }]
  },
  {
    slug: 'payment-receipt', category: 'Billing', name: 'Payment Receipt — SAMPLE', status: 'post-performance',
    use: 'Example receipt structure; real receipts are created only after processor-verified settlement.',
    sections: [{ heading: 'Receipt', lines: ['Receipt ID: RCT-DEMO-0001', 'Invoice: INV-DEMO-0001', 'Amount: $199.00', 'Processor: Stripe — SAMPLE', 'Settlement status: PAID — DEMONSTRATION ONLY', 'Transaction reference: SAMPLE-STRIPE-SESSION'] }, { heading: 'Control', lines: ['Production receipts are generated only after a valid signed processor webhook reconciles the amount and internal invoice.'] }]
  },
  {
    slug: 'refund-void-record', category: 'Billing', name: 'Refund/Void Record — SAMPLE', status: 'post-performance',
    use: 'Illustrates non-destructive accounting history for voided or refunded transactions.',
    sections: [{ heading: 'Adjustment', lines: ['Invoice: INV-DEMO-0002', 'Original amount: $199.00', 'Action: VOID', 'Reason: Duplicate demo invoice', 'Revenue impact: $0 real revenue', 'Actor: Owner — SAMPLE'] }, { heading: 'Audit', lines: ['Original record retained.', 'Adjustment timestamp recorded.', 'No destructive deletion.'] }]
  },
  {
    slug: 'business-entity-readiness-checklist', category: 'Business credit', name: 'Business Entity Readiness Checklist — SAMPLE', status: 'sample',
    use: 'Entity consistency, address, phone, licenses, domain, banking, and records readiness.',
    sections: [{ heading: 'Entity checks', lines: ['Legal name consistent across records: YES', 'Active state registration: YES', 'EIN confirmation available: YES', 'Business address consistent: YES', 'Dedicated phone: YES', 'Domain/email: YES', 'Required licenses: REVIEW', 'Business bank account: YES'] }]
  },
  {
    slug: 'business-banking-readiness-review', category: 'Business credit', name: 'Business Banking Readiness Review — SAMPLE', status: 'sample',
    use: 'Example review of business banking setup and documentation readiness.',
    sections: [{ heading: 'Banking review', lines: ['Operating account open: YES', 'Average balance: SAMPLE $8,500', 'NSF/overdraft pattern: None in synthetic sample', 'Revenue documentation: 6 months synthetic statements', 'Merchant processing: Active — sample'] }, { heading: 'Next actions', lines: ['Maintain clean banking history.', 'Reconcile bookkeeping monthly.', 'Keep business and personal transactions separate.'] }]
  },
  {
    slug: 'vendor-tradeline-tracker', category: 'Business credit', name: 'Vendor Tradeline Tracker — SAMPLE', status: 'sample',
    use: 'Synthetic vendor accounts, reporting status, terms, and payment-history tracking.',
    sections: [{ heading: 'Tradelines', lines: ['DEMO OFFICE SUPPLY — Net 30 — reporting: synthetic yes — payment: on time.', 'DEMO INDUSTRIAL SUPPLY — Net 30 — reporting: synthetic pending — payment: on time.', 'DEMO SOFTWARE VENDOR — monthly — reporting: synthetic no.'] }, { heading: 'Control', lines: ['Do not fabricate purchases, payments, or vendor reporting.', 'Verify actual vendor reporting practices before relying on them.'] }]
  },
  {
    slug: 'business-credit-strategy', category: 'Business credit', name: 'Business Credit Strategy — SAMPLE', status: 'sample',
    use: 'Example phased roadmap for profile readiness, tradelines, monitoring, and funding preparation.',
    sections: [{ heading: 'Phase 1 — foundation', lines: ['Entity consistency.', 'Licensing and address review.', 'Business bank account and bookkeeping.', 'Domain, email, and phone consistency.'] }, { heading: 'Phase 2 — reporting relationships', lines: ['Use commercially appropriate vendors.', 'Pay early/on time.', 'Verify reporting rather than assuming it.'] }, { heading: 'Phase 3 — funding readiness', lines: ['Organize statements and financials.', 'Review utilization and existing obligations.', 'Apply selectively; no approval guarantee.'] }]
  },
  {
    slug: 'funding-readiness-summary', category: 'Business credit', name: 'Funding Readiness Summary — SAMPLE', status: 'sample',
    use: 'Demonstrates readiness indicators without promising approval or financing outcomes.',
    sections: [{ heading: 'Readiness scorecard', lines: ['Entity consistency: READY', 'Banking history: READY', 'Bookkeeping: READY', 'Revenue documentation: PARTIAL', 'Vendor reporting: DEVELOPING', 'Existing debt review: REQUIRED'] }, { heading: 'Decision', lines: ['Overall: PREPARATION STAGE', 'This is not a lending decision, preapproval, or promise of funding.'] }]
  },
  {
    slug: 'client-progress-report', category: 'Operations', name: 'Client Progress Report — SAMPLE', status: 'sample',
    use: 'Example customer-facing summary of completed work, open tasks, evidence, and next approvals.',
    sections: [{ heading: 'Completed', lines: ['Intake completed.', 'Consent recorded.', 'Credit report imported.', 'Evidence indexed.', 'Credit Intelligence Audit prepared.'] }, { heading: 'Open', lines: ['Customer review of dispute draft.', 'Additional payment documentation requested.', 'Owner/compliance approval pending.'] }, { heading: 'Next milestone', lines: ['Deliver approved action plan and update customer portal.'] }]
  },
  {
    slug: 'case-audit-export', category: 'Operations', name: 'Case Audit Export — SAMPLE', status: 'sample',
    use: 'Example chronological log of consent, evidence, AI runs, approvals, billing, and settlement events.',
    sections: [{ heading: 'Audit events', lines: ['08/16/2026 09:00 — client.created — allowed', '08/16/2026 09:10 — consent.credit_report_analysis — granted', '08/16/2026 09:20 — evidence.credit_report_imported — allowed', '08/16/2026 09:30 — ai.credit_intelligence — completed', '08/16/2026 09:40 — dispute.draft — approval_required', '08/16/2026 10:00 — compliance.review — allowed', '08/16/2026 10:30 — milestone.completed — allowed', '08/16/2026 10:35 — invoice.created — open', '08/16/2026 10:45 — payment.webhook — SAMPLE ONLY'] }]
  }
];

export function getDemoDocument(slug: string) {
  return demoDocuments.find((document) => document.slug === slug);
}
