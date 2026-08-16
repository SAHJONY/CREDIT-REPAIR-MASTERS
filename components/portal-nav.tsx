import Link from 'next/link';
import { SignOutButton } from './sign-out-button';

export function PortalNav() {
  return (
    <div className="headerActions">
      <Link className="secondaryButton" href="/portal">Home</Link>
      <Link className="secondaryButton" href="/portal/reports">Reports</Link>
      <Link className="secondaryButton" href="/portal/progress">Progress</Link>
      <Link className="secondaryButton" href="/portal/documents">Documents</Link>
      <Link className="secondaryButton" href="/portal/consents">Consents</Link>
      <Link className="secondaryButton" href="/portal/account">Account</Link>
      <SignOutButton />
    </div>
  );
}
