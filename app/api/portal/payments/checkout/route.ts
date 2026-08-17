import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getBillingInvoice, attachCheckoutSession } from '@/lib/billing-store';
import { requireCustomerPortalSession } from '@/lib/customer-portal';
import { getCommercialService } from '@/lib/service-catalog';
import { getPaymentProviders } from '@/lib/payment-providers';
import { createSquareCheckout } from '@/lib/square-payments';
import { createStripeCheckoutSession } from '@/lib/stripe-payments';

const schema = z.object({
  invoiceId: z.string().min(1),
  provider: z.enum(['stripe', 'square']).default('stripe')
});

export async function POST(request: NextRequest) {
  const portal = await requireCustomerPortalSession();
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'INVALID_CHECKOUT_PAYLOAD' }, { status: 400 });

  const invoice = await getBillingInvoice(portal.organizationId, parsed.data.invoiceId);
  if (!invoice || invoice.clientId !== portal.client.id) return NextResponse.json({ error: 'INVOICE_NOT_FOUND' }, { status: 404 });
  if (invoice.status === 'paid') return NextResponse.json({ error: 'INVOICE_ALREADY_PAID' }, { status: 409 });
  if (invoice.status === 'void') return NextResponse.json({ error: 'INVOICE_VOID' }, { status: 409 });
  if (invoice.eligibilityDecision !== 'eligible') return NextResponse.json({ error: 'INVOICE_NOT_COLLECTIBLE' }, { status: 409 });

  const provider = getPaymentProviders().find((candidate) => candidate.id === parsed.data.provider);
  if (!provider?.configured) return NextResponse.json({ error: `${parsed.data.provider.toUpperCase()}_NOT_CONFIGURED` }, { status: 503 });

  const service = getCommercialService(invoice.serviceId);
  if (!service) return NextResponse.json({ error: 'SERVICE_NOT_FOUND' }, { status: 409 });
  const description = `${service.name} — ${invoice.milestoneLabel}`;

  try {
    if (parsed.data.provider === 'square') {
      const checkout = await createSquareCheckout({
        invoiceId: invoice.id,
        customerEmail: portal.email,
        description,
        amountCents: invoice.amountCents,
        origin: request.nextUrl.origin
      });
      const updated = await attachCheckoutSession(portal.organizationId, invoice.id, 'square', checkout.id, checkout.url);
      if (!updated) return NextResponse.json({ error: 'INVOICE_CHECKOUT_LOCKED' }, { status: 409 });
      return NextResponse.json({ checkoutUrl: checkout.url, provider: 'square' }, { status: 201 });
    }

    const session = await createStripeCheckoutSession({
      invoiceId: invoice.id,
      clientId: portal.client.id,
      organizationId: portal.organizationId,
      customerEmail: portal.email,
      description,
      amountCents: invoice.amountCents,
      origin: request.nextUrl.origin
    });
    const updated = await attachCheckoutSession(portal.organizationId, invoice.id, 'stripe', session.id, session.url);
    if (!updated) return NextResponse.json({ error: 'INVOICE_CHECKOUT_LOCKED' }, { status: 409 });
    return NextResponse.json({ checkoutUrl: session.url, provider: 'stripe' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'CHECKOUT_CREATE_FAILED' }, { status: 503 });
  }
}
