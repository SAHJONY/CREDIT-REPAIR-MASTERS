import { requireCustomerPortalSession } from '@/lib/customer-portal';
import { SahjonyConnectLauncher } from '@/components/sahjony-connect-launcher';

export const dynamic = 'force-dynamic';

export default async function ConnectPage() {
  const portal = await requireCustomerPortalSession();
  return <SahjonyConnectLauncher clientName={portal.client.displayName} />;
}
