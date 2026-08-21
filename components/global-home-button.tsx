'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function GlobalHomeButton() {
  const pathname = usePathname();
  if (pathname === '/') return null;

  return (
    <Link className="globalHomeButton" href="/" aria-label="Back to New850 home" data-no-translate>
      <span aria-hidden="true">←</span><strong>Back to Home</strong>
    </Link>
  );
}
