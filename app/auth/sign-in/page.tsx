import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SignInForm } from '@/components/sign-in-form';
import { getBusinessSession } from '@/lib/session-access';

export const dynamic = 'force-dynamic';

export default async function SignInPage() {
  const session = await getBusinessSession();
  if (session) redirect('/dashboard');

  return (
    <main className="authShell">
      <section className="authExperience">
        <div className="authStory">
          <div className="brandMark" aria-label="New850"><span>N850</span></div>
          <div className="authStoryCopy">
            <div className="eyebrow"><span className="eyebrowDot" />Intelligence for better outcomes</div>
            <h1>Every client.<br />Every detail.<br /><em>Under control.</em></h1>
            <p>One secure workspace to move credit cases forward with clarity, compliance, and confidence.</p>
          </div>
          <div className="trustRow">
            <div><strong>256-bit</strong><span>Encryption</span></div>
            <div><strong>24/7</strong><span>Monitoring</span></div>
            <div><strong>100%</strong><span>Audit trail</span></div>
          </div>
        </div>
        <div className="authPanel">
          <div className="authPanelInner">
            <div className="mobileBrand"><span>N850</span> New850.com</div>
            <div className="kicker">SECURE OWNER PORTAL</div>
            <h2>Welcome back</h2>
            <p className="subtitle">Sign in to continue to your command center.</p>
            <SignInForm />
            <div className="authLinkRow">
              <Link href="/auth/forgot-password">Forgot password?</Link>
              <Link href="/auth/activate">Activate account</Link>
            </div>
            <div className="securityNote"><span aria-hidden="true">✓</span><p><strong>Protected access</strong>Only approved organization members can access business data.</p></div>
          </div>
          <p className="authLegal">By continuing, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </section>
    </main>
  );
}
