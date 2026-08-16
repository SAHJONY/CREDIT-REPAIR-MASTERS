import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

function stripeSecretKey() {
  const value = process.env.STRIPE_SECRET_KEY?.trim();
  if (!value) throw new Error('STRIPE_SECRET_KEY_NOT_CONFIGURED');
  return value;
}

export function stripeWebhookConfigured() {
  return Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim());
}

export async function createStripeCheckoutSession(input: {
  invoiceId: string;
  clientId: string;
  organizationId: string;
  customerEmail: string;
  description: string;
  amountCents: number;
  origin: string;
}) {
  const params = new URLSearchParams();
  params.set('mode', 'payment');
  params.set('client_reference_id', input.invoiceId);
  params.set('customer_email', input.customerEmail);
  params.set('success_url', `${input.origin}/portal/payments?payment=success&session_id={CHECKOUT_SESSION_ID}`);
  params.set('cancel_url', `${input.origin}/portal/payments?payment=cancelled`);
  params.set('line_items[0][price_data][currency]', 'usd');
  params.set('line_items[0][price_data][product_data][name]', input.description);
  params.set('line_items[0][price_data][unit_amount]', String(input.amountCents));
  params.set('line_items[0][quantity]', '1');
  params.set('metadata[invoice_id]', input.invoiceId);
  params.set('metadata[client_id]', input.clientId);
  params.set('metadata[organization_id]', input.organizationId);

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${stripeSecretKey()}`,
      'content-type': 'application/x-www-form-urlencoded'
    },
    body: params.toString(),
    cache: 'no-store'
  });
  const payload = await response.json() as { id?: string; url?: string; error?: { message?: string; code?: string } };
  if (!response.ok || !payload.id || !payload.url) {
    throw new Error(`STRIPE_CHECKOUT_CREATE_FAILED:${payload.error?.code || response.status}`);
  }
  return { id: payload.id, url: payload.url };
}

function parseStripeSignature(header: string) {
  const timestamp = header.split(',').find((part) => part.startsWith('t='))?.slice(2);
  const signatures = header.split(',').filter((part) => part.startsWith('v1=')).map((part) => part.slice(3));
  return { timestamp, signatures };
}

function safeHexEqual(left: string, right: string) {
  try {
    const a = Buffer.from(left, 'hex');
    const b = Buffer.from(right, 'hex');
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function verifyStripeWebhook(rawBody: string, signatureHeader: string) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET_NOT_CONFIGURED');
  const { timestamp, signatures } = parseStripeSignature(signatureHeader);
  if (!timestamp || !signatures.length) throw new Error('STRIPE_SIGNATURE_INVALID');
  const timestampSeconds = Number(timestamp);
  if (!Number.isFinite(timestampSeconds) || Math.abs(Date.now() / 1000 - timestampSeconds) > 300) {
    throw new Error('STRIPE_SIGNATURE_EXPIRED');
  }
  const expected = createHmac('sha256', secret).update(`${timestamp}.${rawBody}`, 'utf8').digest('hex');
  if (!signatures.some((candidate) => safeHexEqual(candidate, expected))) throw new Error('STRIPE_SIGNATURE_INVALID');
  return JSON.parse(rawBody) as {
    id: string;
    type: string;
    data?: {
      object?: {
        id?: string;
        payment_status?: string;
        amount_total?: number;
        payment_intent?: string | null;
        client_reference_id?: string | null;
        metadata?: Record<string, string>;
      };
    };
  };
}

export function fingerprintStripePayload(rawBody: string) {
  return createHash('sha256').update(rawBody, 'utf8').digest('hex');
}
