import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SignOutButton } from '@/components/sign-out-button';
import { documentLibrary } from '@/lib/document-library';
import { getBusinessSession } from '@/lib/session-access';

export const dynamic = 'force-dynamic';

export default async function DemoDocumentsPage() {
  const session = await getBusinessSession();
  if (!session) redirect('/auth/sign-in');
  if (session.mfaRequired && !session.mfaAssured) redirect('/auth/mfa');

  const categories = Array.from(new Set(documentLibrary.map((document) => document.category)));

  return (
    <main>
      <header className="appHeader">
        <div>
          <div className="kicker">CREDIT REPAIR MASTERS / DOCUMENT TEMPLATE LIBRARY</div>
          <h1>Complete Document Texts</h1>
          <p className="subtitle">Read the full operational text for consumer credit, Florida disclosures, disputes, evidence, billing, compliance, and business-credit documents.</p>
        </div>
        <div className="headerActions">
          <Link className="secondaryButton" href="/documents">Client Documents</Link>
          <Link className="secondaryButton" href="/demo">Demo OS</Link>
          <Link className="secondaryButton" href="/dashboard">Dashboard</Link>
          <SignOutButton />
        </div>
      </header>

      <section className="grid">
        <div className="card span12">
          <div className="label">Coverage</div>
          <h2>{documentLibrary.length} full-text templates across {categories.length} workflow categories</h2>
          <div className="guardrail">These are substantive production-draft texts, not one-line placeholders. Required federal and Florida notices preserve prescribed statutory language. Before use with a real customer, the generation workflow must merge the actual customer, provider, price, dates, bond/trust information when applicable, and state-specific terms. Legal review is still required before commercial rollout in a new jurisdiction.</div>
        </div>

        {categories.map((category) => (
          <div className="card span6" key={category}>
            <div className="label">{category}</div>
            <h2>Full-text documents</h2>
            {documentLibrary.filter((document) => document.category === category).map((document) => (
              <Link className="listRow" href={`/demo/documents/${document.slug}`} key={document.slug}>
                <div>
                  <strong>{document.name}</strong>
                  <div className="small">{document.use}</div>
                  <div className="small" style={{ marginTop: 4 }}>Read full text →</div>
                </div>
                <span className={`pill ${document.status === 'approval required' ? 'medium' : document.status === 'post-performance' ? 'low' : 'medium'}`}>{document.status}</span>
              </Link>
            ))}
          </div>
        ))}
      </section>
    </main>
  );
}
