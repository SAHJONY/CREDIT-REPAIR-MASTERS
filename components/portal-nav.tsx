'use client';

import Link from 'next/link';
import { authClient } from '@/lib/auth/client';

export function PortalNav() {
  async function signOut() {
    await authClient.signOut();
    window.location.assign('/portal/sign-in');
  }

  return (
    <nav className="portalNav" aria-label="Customer portal">
      <Link href="/portal">Home</Link>
      <Link href="/portal/passport">Financial Passport</Link>
      <Link href="/portal/marketplace">Marketplace</Link>
      <Link href="/portal/progress">Progress</Link>
      <Link href="/portal/documents">Documents</Link>
      <Link href="/portal/payments">Payments</Link>
      <details className="portalMore">
        <summary>More</summary>
        <div><Link href="/portal/reports">Credit reports</Link><Link href="/portal/consents">Authorizations</Link><Link href="/portal/account">Account</Link><button type="button" onClick={signOut}>Sign out</button></div>
      </details>
    </nav>
  );
}
