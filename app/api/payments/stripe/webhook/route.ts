import { NextRequest, NextResponse } from 'next/server';
import { getBillingInvoice, settleStripeInvoice } from '@/lib/billing-store';
import { fingerprintStripePayload, verifyStripeWebhook } from '@/lib/stripe-payments';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'STRIPE_SIGNATURE_REQUIRED' }, { status: 400 });

  let event;
  try {
    event = verifyStripeWebhook(rawBody, signature);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'STRIPE_SIGNATURE_INVALID' }, { status: 400 });
  }

  if (event.type !== 'checkout.session.completed') return NextResponse.json({ received: true });
  const session = event.data?.object;
  const invoiceId = session?.metadata?.invoice_id || session?.client_reference_id || '';
  const organizationId = session?.metadata?.organization_id || '';
  const amountTotal = Number(session?.amount_total || 0);
  if (!invoiceId || !organizationId || !session?.id || session.payment_status !== 'paid' || amountTotal <= 0) {
    return NextResponse.json({ error: 'STRIPE_EVENT_NOT_SETTLEABLE' }, { status: 409 });
  }

  const invoice = await getBillingInvoice(organizationId, invoiceId);
  if (!invoice) return NextResponse.json({ error: 'INVOICE_NOT_FOUND' }, { status: 404 });
  if (invoice.amountCents !== amountTotal) return NextResponse.json({ error: 'PAYMENT_AMOUNT_MISMATCH' }, { status: 409 });
  if (invoice.providerSessionId && invoice.providerSessionId !== session.id) return NextResponse.json({ error: 'CHECKOUT_SESSION_MISMATCH' }, { status: 409 });

  const settled = await settleStripeInvoice({
    organizationId,
    invoiceId,
    sessionId: session.id,
    paymentId: session.payment_intent || undefined,
    providerEventId: event.id,
    eventType: event.type,
    amountCents: amountTotal,
    payloadFingerprint: fingerprintStripePayload(rawBody)
  });
  if (!settled) return NextResponse.json({ error: 'INVOICE_SETTLEMENT_REJECTED' }, { status: 409 });
  return NextResponse.json({ received: true, invoiceId, status: settled.status });
}
