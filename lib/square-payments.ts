import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

declare const process: { env: Record<string, string | undefined> };

const SQUARE_VERSION = '2026-07-15';

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name}_NOT_CONFIGURED`);
  return value;
}

function squareBaseUrl() {
  return process.env.SQUARE_ENVIRONMENT?.trim().toLowerCase() === 'sandbox'
    ? 'https://connect.squareupsandbox.com'
    : 'https://connect.squareup.com';
}

export async function createSquareCheckout(input: {
  invoiceId: string;
  customerEmail: string;
  description: string;
  amountCents: number;
  origin: string;
}) {
  const accessToken = required('SQUARE_ACCESS_TOKEN');
  const locationId = required('SQUARE_LOCATION_ID');

  const response = await fetch(`${squareBaseUrl()}/v2/online-checkout/payment-links`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Square-Version': SQUARE_VERSION
    },
    body: JSON.stringify({
      idempotency_key: randomUUID(),
      description: input.description,
      quick_pay: {
        name: input.description,
        price_money: { amount: input.amountCents, currency: 'USD' },
        location_id: locationId
      },
      checkout_options: {
        redirect_url: `${input.origin}/portal/payments?provider=square&checkout=returned`
      },
      pre_populated_data: { buyer_email: input.customerEmail },
      payment_note: `crm_invoice:${input.invoiceId}`
    })
  });

  const payload = await response.json() as {
    errors?: Array<{ code?: string; detail?: string }>;
    payment_link?: { id?: string; order_id?: string; url?: string };
  };

  if (!response.ok || !payload.payment_link?.url || !payload.payment_link?.order_id) {
    const detail = payload.errors?.map((e) => e.detail || e.code).filter(Boolean).join('; ');
    throw new Error(detail || 'SQUARE_CHECKOUT_CREATE_FAILED');
  }

  return {
    id: payload.payment_link.order_id,
    linkId: payload.payment_link.id || '',
    url: payload.payment_link.url
  };
}

export function verifySquareWebhook(rawBody: string, signature: string | null, notificationUrl: string) {
  if (!signature) return false;
  const signatureKey = required('SQUARE_WEBHOOK_SIGNATURE_KEY');
  const expected = createHmac('sha256', signatureKey)
    .update(`${notificationUrl}${rawBody}`, 'utf8')
    .digest('base64');

  const left = Buffer.from(expected);
  const right = Buffer.from(signature);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function squarePayloadFingerprint(rawBody: string) {
  return createHash('sha256').update(rawBody).digest('hex');
}
