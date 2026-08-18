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
          <div className="kicker">CREDIT REPAIR MASTERS / DOCUMENT REFERENCE LIBRARY</div>
          <h1>Document Reference Texts</h1>
          <p className="subtitle">Reference material for consumer credit, Florida disclosures, evidence, billing, compliance, business credit, and historical dispute examples.</p>
        </div>
        <div className="headerActions">
          <Link className="primaryButton" href="/documents">Create client documents</Link>
          <Link className="secondaryButton" href="/demo">Demo OS</Link>
          <Link className="secondaryButton" href="/dashboard">Dashboard</Link>
          <SignOutButton />
        </div>
      </header>

      <section className="grid">
        <div className="card span12">
          <div className="label">REFERENCE LIBRARY</div>
          <h2>{documentLibrary.length} full-text references across {categories.length} workflow categories</h2>
          <div className="guardrail">These texts are reference material. Required statutory notices and approved agreements may preserve prescribed wording, but real client dispute letters must not be created by copying the legacy dispute examples in this library. For a real consumer dispute, use Client Documents → Client-Voice Dispute Drafting so the letter is generated from the client's confirmed facts, actual evidence, requested correction, and recorded review/approval gates.</div>
        </div>

        {categories.map((category) => {
          const isDisputeCategory = category.toLowerCase().includes('dispute');
          return (
            <div className="card span6" key={category}>
              <div className="label">{category}</div>
              <h2>{isDisputeCategory ? 'Historical / reference examples' : 'Full-text documents'}</h2>
              {isDisputeCategory ? <div className="guardrail" style={{ marginBottom: 12 }}>REFERENCE ONLY — Do not copy these dispute examples into a real client file. Use the client-voice drafting workflow for live cases.</div> : null}
              {documentLibrary.filter((document) => document.category === category).map((document) => (
                <Link className="listRow" href={`/demo/documents/${document.slug}`} key={document.slug}>
                  <div>
                    <strong>{document.name}</strong>
                    <div className="small">{document.use}</div>
                    <div className="small" style={{ marginTop: 4 }}>{isDisputeCategory ? 'Read reference text →' : 'Read full text →'}</div>
                  </div>
                  <span className={`pill ${isDisputeCategory ? 'medium' : document.status === 'post-performance' ? 'low' : 'medium'}`}>{isDisputeCategory ? 'reference only' : document.status}</span>
                </Link>
              ))}
            </div>
          );
        })}
      </section>
    </main>
  );
}
