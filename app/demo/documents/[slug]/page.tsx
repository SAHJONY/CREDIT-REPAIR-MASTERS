import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { SignOutButton } from '@/components/sign-out-button';
import { demoDocuments, getDemoDocument } from '@/lib/demo-documents';
import { getBusinessSession } from '@/lib/session-access';

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return demoDocuments.map((document) => ({ slug: document.slug }));
}

export default async function DemoDocumentReader({ params }: { params: Promise<{ slug: string }> }) {
  const session = await getBusinessSession();
  if (!session) redirect('/auth/sign-in');
  if (session.mfaRequired && !session.mfaAssured) redirect('/auth/mfa');

  const { slug } = await params;
  const document = getDemoDocument(slug);
  if (!document) notFound();

  return (
    <main>
      <header className="appHeader">
        <div>
          <div className="kicker">CREDIT REPAIR MASTERS / DEMO DOCUMENT / {document.category}</div>
          <h1>{document.name}</h1>
          <p className="subtitle">{document.use}</p>
        </div>
        <div className="headerActions">
          <Link className="secondaryButton" href="/demo/documents">All documents</Link>
          <Link className="secondaryButton" href="/demo">Demo OS</Link>
          <SignOutButton />
        </div>
      </header>

      <section className="grid">
        <div className="card span12">
          <div className="row">
            <div><div className="label">DOCUMENT STATUS</div><h2>SAMPLE / DEMO — NOT A REAL CUSTOMER RECORD</h2></div>
            <span className={`pill ${document.status === 'approval required' ? 'medium' : document.status === 'post-performance' ? 'low' : 'medium'}`}>{document.status}</span>
          </div>
          <div className="guardrail">This example is synthetic. It is not signed, submitted, verified, paid, or legally effective. Production documents must use the real client record, applicable state rules, evidence, approvals, and e-signature workflow.</div>
        </div>

        <div className="card span12" style={{ maxWidth: 920, margin: '0 auto', width: '100%' }}>
          <div className="label">CREDIT REPAIR MASTERS</div>
          <h2 style={{ marginBottom: 22 }}>{document.name.replace(' — SAMPLE', '')}</h2>
          {document.sections.map((section) => (
            <section key={section.heading} style={{ marginBottom: 26 }}>
              <h3>{section.heading}</h3>
              <div style={{ marginTop: 10 }}>
                {section.lines.map((line, index) => line === '' ? <div key={`${section.heading}-${index}`} style={{ height: 12 }} /> : <p key={`${section.heading}-${index}`} style={{ margin: '6px 0', lineHeight: 1.55 }}>{line}</p>)}
              </div>
            </section>
          ))}
          <div className="guardrail">SAMPLE / DEMO / TRAINING USE ONLY — generated for CREDIT REPAIR MASTERS OS workflow demonstration.</div>
        </div>

        <div className="card span12">
          <div className="row">
            <div><div className="label">Navigation</div><h2>Continue reviewing examples</h2></div>
            <Link className="primaryButton" href="/demo/documents">Back to all 33 documents</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
