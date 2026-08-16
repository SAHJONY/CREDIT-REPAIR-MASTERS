import { NextResponse } from 'next/server';
import { getCustomerPortalSession } from '@/lib/customer-portal';
import { paymentProviderSummary } from '@/lib/payment-providers';

export async function GET() {
  const portal = await getCustomerPortalSession();
  if (!portal) return NextResponse.json({ error: 'CUSTOMER_PORTAL_AUTH_REQUIRED' }, { status: 401 });

  const summary = paymentProviderSummary();
  return NextResponse.json({
    clientId: portal.client.id,
    configuredProviders: summary.configured,
    totalProviders: summary.total,
    methods: summary.methods,
    providers: summary.providers.map((provider) => ({
      id: provider.id,
      name: provider.name,
      configured: provider.configured,
      mode: provider.mode,
      methods: provider.methods,
      detail: provider.detail
    })),
    collectionPolicy: 'Payment methods are presented only after the billing eligibility gate permits collection for the specific service and jurisdiction.'
  });
}
