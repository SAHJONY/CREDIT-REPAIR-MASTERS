import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SignOutButton } from '@/components/sign-out-button';
import { demoDocuments } from '@/lib/demo-documents';
import { getBusinessSession } from '@/lib/session-access';

export const dynamic = 'force-dynamic';

export default async function DemoDocumentsPage() {
  const session = await getBusinessSession();
  if (!session) redirect('/auth/sign-in');
  if (session.mfaRequired && !session.mfaAssured) redirect('/auth/mfa');

  const categories = Array.from(new Set(demoDocuments.map((document) => document.category)));

  return (
    <main>
      <header className="appHeader">
        <div>
          <div className="kicker">CREDIT REPAIR MASTERS / DEMO DOCUMENTS</div>
          <h1>Document Examples Library</h1>
          <p className="subtitle">Open and read every synthetic document used to demonstrate the complete personal credit, billing, compliance, and business-credit workflow.</p>
        </div>
        <div className="headerActions">
          <Link className="secondaryButton" href="/demo">Demo OS</Link>
          <Link className="secondaryButton" href="/launch">Launch Center</Link>
          <Link className="secondaryButton" href="/dashboard">Dashboard</Link>
          <SignOutButton />
        </div>
      </header>

      <section className="grid">
        <div className="card span12">
          <div className="label">Coverage</div>
          <h2>{demoDocuments.length} complete sample documents across {categories.length} workflow categories</h2>
          <div className="guardrail">Every document can now be opened and read. All examples remain SAMPLE/DEMO and cannot be treated as signed agreements, real evidence, submitted disputes, real invoices, or real payments.</div>
        </div>

        {categories.map((category) => (
          <div className="card span6" key={category}>
            <div className="label">{category}</div>
            <h2>Example documents</h2>
            {demoDocuments.filter((document) => document.category === category).map((document) => (
              <Link className="listRow" href={`/demo/documents/${document.slug}`} key={document.slug}>
                <div>
                  <strong>{document.name}</strong>
                  <div className="small">{document.use}</div>
                  <div className="small" style={{ marginTop: 4 }}>Open full document →</div>
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
