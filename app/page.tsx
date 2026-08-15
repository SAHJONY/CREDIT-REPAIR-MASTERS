import { redirect } from 'next/navigation';
import { getBusinessSession } from '@/lib/session-access';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await getBusinessSession();
  redirect(session ? '/dashboard' : '/auth/sign-in');
}
