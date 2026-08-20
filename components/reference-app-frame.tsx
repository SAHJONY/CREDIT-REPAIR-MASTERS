'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

const ownerItems = [
  ['⌂','Dashboard','/dashboard'],['◎','Clients','/clients'],['↗','Growth','/growth'],['◈','Launch','/launch'],['▤','Documents','/documents'],['▱','Billing','/billing'],['✓','Compliance','/compliance'],['◇','Demo','/demo']
] as const;

const portalItems = [
  ['⌂','Dashboard','/portal'],['↗','Credit Progress','/portal/progress'],['▣','Reports & Scores','/portal/reports'],['⌁','Disputes','/portal/progress'],['▤','Documents','/portal/documents'],['▱','Payments','/portal/payments'],['◇','Education','/portal/progress'],['◎','Account','/portal/account']
] as const;

const publicPrefixes = ['/services','/get-started','/loans','/auto','/mortgage','/business-funding','/marketplace'] as const;

function isPublic(pathname: string) {
  return pathname === '/' || publicPrefixes.some((prefix) => pathname.startsWith(prefix)) || pathname.startsWith('/auth/') || pathname === '/portal/sign-in' || pathname.startsWith('/portal/activate') || pathname.startsWith('/portal/forgot-password');
}

export function ReferenceAppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (isPublic(pathname)) return <>{children}</>;
  const portal = pathname.startsWith('/portal');
  const items = portal ? portalItems : ownerItems;

  return (
    <div className="referenceAppFrame">
      <aside className="referenceSidebar">
        <Link href={portal ? '/portal' : '/dashboard'} className="referenceSideBrand">
          <span>850</span><strong>NEW850.COM<br/>FINANCIAL READINESS</strong>
        </Link>
        <nav className="referenceSideNav" aria-label={portal ? 'Client portal' : 'Owner OS'}>
          {items.map(([icon,label,href]) => <Link key={label} href={href} className={pathname === href || (href !== '/portal' && href !== '/dashboard' && pathname.startsWith(href)) ? 'active' : ''}><i>{icon}</i><span>{label}</span></Link>)}
        </nav>
        <div className="referenceSideQuote"><b>“</b><p>{portal ? 'Better preparation can open doors to better financial opportunities.' : 'Operate with clarity. Automate with controls.'}</p><small>— New850.com</small></div>
        <div className="referenceSideStatus"><i>✓</i><div><b>{portal ? 'Private Client Portal' : 'New850 Owner OS'}</b><small>Secure · Compliance-first</small></div></div>
      </aside>
      <div className="referenceAppMain">
        <div className="referenceAppAmbient" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}
