import { NextRequest, NextResponse } from 'next/server';
import { settleSquareInvoice } from '@/lib/billing-store';
import { squarePayloadFingerprint, verifySquareWebhook } from '@/lib/square-payments';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-square-hmacsha256-signature');
  const notificationUrl = process.env.SQUARE_WEBHOOK_NOTIFICATION_URL?.trim() || request.nextUrl.toString();

  let verified = false;
  try {
    verified = verifySquareWebhook(rawBody, signature, notificationUrl);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'SQUARE_SIGNATURE_INVALID' }, { status: 503 });
  }
  if (!verified) return NextResponse.json({ error: 'SQUARE_SIGNATURE_INVALID' }, { status: 403 });

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'SQUARE_EVENT_INVALID_JSON' }, { status: 400 });
  }

  if (!['payment.updated', 'payment.created'].includes(event?.type)) return NextResponse.json({ received: true });
  const payment = event?.data?.object?.payment;
  if (!payment || payment.status !== 'COMPLETED') return NextResponse.json({ received: true });

  const orderId = String(payment.order_id || '');
  const paymentId = String(payment.id || '');
  const eventId = String(event.event_id || event.id || '');
  const amountCents = Number(payment.amount_money?.amount || 0);
  if (!orderId || !paymentId || !eventId || amountCents <= 0) {
    return NextResponse.json({ error: 'SQUARE_EVENT_NOT_SETTLEABLE' }, { status: 409 });
  }

  const settled = await settleSquareInvoice({
    orderId,
    paymentId,
    providerEventId: eventId,
    eventType: event.type,
    amountCents,
    payloadFingerprint: squarePayloadFingerprint(rawBody)
  });
  if (!settled) return NextResponse.json({ error: 'INVOICE_SETTLEMENT_REJECTED' }, { status: 409 });

  return NextResponse.json({ received: true, invoiceId: settled.id, status: settled.status });
}
