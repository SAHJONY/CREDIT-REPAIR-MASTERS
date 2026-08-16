import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <header className="appHeader">
        <div><div className="kicker">CREDIT REPAIR MASTERS</div><h1>Credit intelligence with a secure client portal.</h1><p className="subtitle">Upload your consumer credit reports privately, control your authorizations, and follow your case progress without sharing bureau passwords.</p></div>
        <div className="headerActions"><Link className="primaryButton" href="/portal/sign-in">Client sign in</Link><Link className="secondaryButton" href="/services">Services</Link><Link className="secondaryButton" href="/auth/sign-in">Staff sign in</Link></div>
      </header>
      <section className="grid">
        <div className="card span4"><div className="label">1. Get your reports</div><h2>Official free sources</h2><p className="small">Use AnnualCreditReport.com or the bureaus directly. Consumer authentication stays between you and the reporting company.</p></div>
        <div className="card span4"><div className="label">2. Upload privately</div><h2>Evidence Vault</h2><p className="small">Your report is stored in a private document vault and linked only to your authorized client profile.</p></div>
        <div className="card span4"><div className="label">3. Follow progress</div><h2>Clear milestones</h2><p className="small">See intake, analysis, documents, authorizations, and customer-safe case activity in one place.</p></div>
        <div className="card span12"><div className="label">Security model</div><h2>Your account is isolated from every other customer.</h2><div className="guardrail">Customer access is role-gated and mapped one-to-one to a client record. Staff administration, internal agents, audit controls, and other customer records are not exposed through the portal.</div><div className="headerActions" style={{ marginTop: 16 }}><Link className="primaryButton" href="/portal/sign-in">Open my client portal</Link><Link className="secondaryButton" href="/services">View services</Link></div></div>
      </section>
      <footer>Credit Repair Masters does not guarantee score increases or deletion of accurate information. Consumer credit services remain subject to applicable federal and state requirements.</footer>
    </main>
  );
}
