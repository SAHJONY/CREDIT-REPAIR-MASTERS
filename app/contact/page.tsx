import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact New850',
  description: 'Contact the right New850 team for support, accounts, billing, compliance, privacy, partnerships, and business inquiries.'
};

const departments = [
  ['GENERAL', 'General Inquiries', 'Questions that do not fit another department.', 'hello@new850.com'],
  ['CUSTOMER CARE', 'Customer Support', 'Portal access, service questions, and help with an active account.', 'support@new850.com'],
  ['NEW CLIENTS', 'Sales & Readiness', 'Programs, pricing, readiness assessments, and choosing the right service.', 'sales@new850.com'],
  ['ONBOARDING', 'Client Onboarding', 'Activation, agreements, required information, and getting started.', 'onboarding@new850.com'],
  ['ACCOUNTS', 'Billing & Payments', 'Invoices, receipts, payment questions, and account billing records.', 'billing@new850.com'],
  ['DOCUMENTS', 'Secure Document Support', 'Help uploading, locating, or understanding requested documents. Never email sensitive files.', 'documents@new850.com'],
  ['GOVERNANCE', 'Compliance', 'Service controls, disclosures, complaints, and regulatory communications.', 'compliance@new850.com'],
  ['DATA RIGHTS', 'Privacy', 'Privacy questions and requests concerning personal information.', 'privacy@new850.com'],
  ['BUSINESS', 'Partnerships', 'Lender, marketplace, technology, referral, and strategic partnership inquiries.', 'partnerships@new850.com'],
  ['ACCESS', 'Accessibility', 'Website or service accessibility assistance and accommodation requests.', 'accessibility@new850.com'],
  ['TRUST', 'Security', 'Responsible reports of suspected security or account-safety issues.', 'security@new850.com'],
  ['PRESS', 'Media', 'Press, speaking, brand, and public-information requests.', 'media@new850.com']
] as const;

export default function ContactPage() {
  return (
    <main className="contactDirectory">
      <div className="contactDirectoryInner">
        <header className="contactIntro">
          <span className="referencePill">NEW850 BUSINESS COMMUNICATIONS</span>
          <h1>Reach the right team.</h1>
          <p>Choose the department that best matches your request so it can be reviewed by the appropriate New850 team.</p>
        </header>
        <section className="contactGrid" aria-label="New850 email departments">
          {departments.map(([label, name, description, email]) => (
            <article className="contactCard" key={email}>
              <small>{label}</small>
              <h2>{name}</h2>
              <p>{description}</p>
              <a href={`mailto:${email}`}>{email}</a>
            </article>
          ))}
        </section>
        <aside className="contactNotice">
          <strong>Protect your information.</strong> Do not send Social Security numbers, bureau credentials, full account numbers, identity documents, or credit reports by email. Existing clients should use the <a href="/portal/sign-in">secure client portal</a> for sensitive records. Email is not monitored for emergencies.
        </aside>
      </div>
    </main>
  );
}
