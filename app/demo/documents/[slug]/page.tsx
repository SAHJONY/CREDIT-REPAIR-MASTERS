import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { SignOutButton } from '@/components/sign-out-button';
import { documentLibrary, getLibraryDocument } from '@/lib/document-library';
import { getBusinessSession } from '@/lib/session-access';

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return documentLibrary.map((document) => ({ slug: document.slug }));
}

export default async function DocumentReader({ params }: { params: Promise<{ slug: string }> }) {
  const session = await getBusinessSession();
  if (!session) redirect('/auth/sign-in');
  if (session.mfaRequired && !session.mfaAssured) redirect('/auth/mfa');

  const { slug } = await params;
  const document = getLibraryDocument(slug);
  if (!document) notFound();
  const isLegacyDispute = document.category.toLowerCase().includes('dispute');

  return (
    <main>
      <header className="appHeader">
        <div>
          <div className="kicker">CREDIT REPAIR MASTERS / DOCUMENT REFERENCE / {document.category}</div>
          <h1>{document.name}</h1>
          <p className="subtitle">{document.use}</p>
        </div>
        <div className="headerActions">
          {isLegacyDispute ? <Link className="primaryButton" href="/documents">Create client-voice draft</Link> : null}
          <Link className="secondaryButton" href="/demo/documents">All references</Link>
          <Link className="secondaryButton" href="/documents">Client Documents</Link>
          <SignOutButton />
        </div>
      </header>

      <section className="grid">
        <div className="card span12">
          <div className="row">
            <div><div className="label">DOCUMENT STATUS</div><h2>{isLegacyDispute ? 'REFERENCE ONLY — NOT FOR LIVE CLIENT USE' : 'PRODUCTION DRAFT REFERENCE'}</h2></div>
            <span className={`pill ${isLegacyDispute ? 'medium' : document.status === 'post-performance' ? 'low' : 'medium'}`}>{isLegacyDispute ? 'reference only' : document.status}</span>
          </div>
          {isLegacyDispute ? (
            <div className="guardrail">This is a historical/reference dispute example. Do not copy, merge, or mass-produce this wording for a real consumer. Real client disputes must be drafted through Client Documents → Client-Voice Dispute Drafting from confirmed client facts, actual supporting evidence, and the specific requested correction. The resulting draft still requires client review and approval before any transmission.</div>
          ) : (
            <div className="guardrail">This page contains substantive reference text. Merge fields such as {'{{client.legalName}}'} must be replaced with actual client/provider data before execution. Required legal notices must not be paraphrased by the generation workflow. State-specific legal review is required before expansion beyond validated jurisdictions.</div>
          )}
        </div>

        <div className="card span12" style={{ maxWidth: 920, margin: '0 auto', width: '100%' }}>
          <div className="label">CREDIT REPAIR MASTERS</div>
          <h2 style={{ marginBottom: 22 }}>{document.name.replace(' — PRODUCTION DRAFT', '')}</h2>
          {document.sections.map((section) => (
            <section key={section.heading} style={{ marginBottom: 26 }}>
              <h3>{section.heading}</h3>
              <div style={{ marginTop: 10 }}>
                {section.lines.map((line, index) => line === '' ? <div key={`${section.heading}-${index}`} style={{ height: 12 }} /> : <p key={`${section.heading}-${index}`} style={{ margin: '6px 0', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{line}</p>)}
              </div>
            </section>
          ))}
        </div>

        <div className="card span12">
          <div className="row">
            <div><div className="label">Navigation</div><h2>{isLegacyDispute ? 'Use the live client-specific workflow' : 'Continue reviewing full texts'}</h2></div>
            <Link className="primaryButton" href={isLegacyDispute ? '/documents' : '/demo/documents'}>{isLegacyDispute ? 'Open Client-Voice Drafting' : 'Back to document library'}</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
