'use client';

import Link from 'next/link';
import { authClient } from '@/lib/auth/client';

export function PortalNav() {
  async function signOut() {
    await authClient.signOut();
    window.location.assign('/portal/sign-in');
  }

  return (
    <div className="headerActions">
      <Link className="secondaryButton" href="/portal">Home</Link>
      <Link className="secondaryButton" href="/portal/reports">Reports</Link>
      <Link className="secondaryButton" href="/portal/progress">Progress</Link>
      <Link className="secondaryButton" href="/portal/documents">Documents</Link>
      <Link className="secondaryButton" href="/portal/consents">Consents</Link>
      <Link className="secondaryButton" href="/portal/payments">Payments</Link>
      <Link className="secondaryButton" href="/portal/account">Account</Link>
      <button className="secondaryButton" type="button" onClick={signOut}>Sign out</button>
    </div>
  );
}
