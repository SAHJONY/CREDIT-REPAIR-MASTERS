import { neon } from '@neondatabase/serverless';

export type BillingInvoiceStatus = 'open' | 'checkout_pending' | 'paid' | 'void';

export type BillingInvoice = {
  id: string;
  organizationId: string;
  clientId: string;
  serviceId: string;
  milestoneLabel: string;
  amountCents: number;
  currency: 'usd';
  status: BillingInvoiceStatus;
  eligibilityDecision: 'eligible' | 'deferred' | 'manual_review' | 'blocked';
  eligibilitySnapshot: unknown;
  provider?: string;
  providerSessionId?: string;
  providerPaymentId?: string;
  checkoutUrl?: string;
  dueAt?: string;
  paidAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

type InvoiceRow = {
  id: string;
  organization_id: string;
  client_id: string;
  service_id: string;
  milestone_label: string;
  amount_cents: number;
  currency: 'usd';
  status: BillingInvoiceStatus;
  eligibility_decision: BillingInvoice['eligibilityDecision'];
  eligibility_snapshot: unknown;
  provider: string | null;
  provider_session_id: string | null;
  provider_payment_id: string | null;
  checkout_url: string | null;
  due_at: string | null;
  paid_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

function databaseUrl() {
  const value = process.env.DATABASE_URL?.trim();
  if (!value) throw new Error('PRODUCTION_DATABASE_NOT_CONFIGURED');
  return value;
}

function mapInvoice(row: InvoiceRow): BillingInvoice {
  return {
    id: row.id,
    organizationId: row.organization_id,
    clientId: row.client_id,
    serviceId: row.service_id,
    milestoneLabel: row.milestone_label,
    amountCents: Number(row.amount_cents),
    currency: row.currency,
    status: row.status,
    eligibilityDecision: row.eligibility_decision,
    eligibilitySnapshot: row.eligibility_snapshot ?? {},
    provider: row.provider || undefined,
    providerSessionId: row.provider_session_id || undefined,
    providerPaymentId: row.provider_payment_id || undefined,
    checkoutUrl: row.checkout_url || undefined,
    dueAt: row.due_at || undefined,
    paidAt: row.paid_at || undefined,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function undefinedTable(error: unknown) {
  return Boolean(error && typeof error === 'object' && 'code' in error && (error as { code?: string }).code === '42P01');
}

export async function listBillingInvoices(organizationId: string, clientId?: string): Promise<BillingInvoice[]> {
  const sql = neon(databaseUrl());
  try {
    const rows = clientId
      ? await sql`select * from billing_invoices where organization_id = ${organizationId} and client_id = ${clientId} order by created_at desc limit 100`
      : await sql`select * from billing_invoices where organization_id = ${organizationId} order by created_at desc limit 250`;
    return (rows as InvoiceRow[]).map(mapInvoice);
  } catch (error) {
    if (undefinedTable(error)) return [];
    throw error;
  }
}

export async function getBillingInvoice(organizationId: string, invoiceId: string): Promise<BillingInvoice | null> {
  const sql = neon(databaseUrl());
  try {
    const rows = await sql`select * from billing_invoices where organization_id = ${organizationId} and id = ${invoiceId} limit 1`;
    return rows[0] ? mapInvoice(rows[0] as InvoiceRow) : null;
  } catch (error) {
    if (undefinedTable(error)) return null;
    throw error;
  }
}

export async function findActiveDuplicateInvoice(input: { organizationId: string; clientId: string; serviceId: string; milestoneLabel: string }) {
  const sql = neon(databaseUrl());
  const normalized = input.milestoneLabel.trim().toLowerCase();
  const rows = await sql`select * from billing_invoices
    where organization_id = ${input.organizationId}
      and client_id = ${input.clientId}
      and service_id = ${input.serviceId}
      and lower(trim(milestone_label)) = ${normalized}
      and status in ('open','checkout_pending')
    order by created_at asc limit 1`;
  return rows[0] ? mapInvoice(rows[0] as InvoiceRow) : null;
}

export async function createBillingInvoice(input: {
  id: string;
  organizationId: string;
  clientId: string;
  serviceId: string;
  milestoneLabel: string;
  amountCents: number;
  eligibilityDecision: BillingInvoice['eligibilityDecision'];
  eligibilitySnapshot: unknown;
  createdBy: string;
  dueAt?: string;
}) {
  const sql = neon(databaseUrl());
  const rows = await sql`insert into billing_invoices (
    id, organization_id, client_id, service_id, milestone_label, amount_cents, currency, status,
    eligibility_decision, eligibility_snapshot, due_at, created_by, created_at, updated_at
  ) values (
    ${input.id}, ${input.organizationId}, ${input.clientId}, ${input.serviceId}, ${input.milestoneLabel},
    ${input.amountCents}, 'usd', 'open', ${input.eligibilityDecision}, ${JSON.stringify(input.eligibilitySnapshot)}::jsonb,
    ${input.dueAt || null}, ${input.createdBy}, now(), now()
  ) returning *`;
  return mapInvoice(rows[0] as InvoiceRow);
}

export async function voidBillingInvoice(organizationId: string, invoiceId: string) {
  const sql = neon(databaseUrl());
  const rows = await sql`update billing_invoices set status = 'void', updated_at = now()
    where organization_id = ${organizationId} and id = ${invoiceId} and status in ('open','checkout_pending')
    returning *`;
  return rows[0] ? mapInvoice(rows[0] as InvoiceRow) : null;
}

export async function attachCheckoutSession(organizationId: string, invoiceId: string, sessionId: string, checkoutUrl: string) {
  const sql = neon(databaseUrl());
  const rows = await sql`update billing_invoices set
    status = case when status = 'paid' then status else 'checkout_pending' end,
    provider = 'stripe', provider_session_id = ${sessionId}, checkout_url = ${checkoutUrl}, updated_at = now()
    where organization_id = ${organizationId} and id = ${invoiceId} and status in ('open','checkout_pending')
    returning *`;
  return rows[0] ? mapInvoice(rows[0] as InvoiceRow) : null;
}

export async function settleStripeInvoice(input: {
  organizationId: string;
  invoiceId: string;
  sessionId: string;
  paymentId?: string;
  providerEventId: string;
  eventType: string;
  amountCents: number;
  payloadFingerprint: string;
}) {
  const sql = neon(databaseUrl());
  const updated = await sql`update billing_invoices set
    status = 'paid', provider = 'stripe', provider_session_id = ${input.sessionId},
    provider_payment_id = ${input.paymentId || null}, paid_at = coalesce(paid_at, now()), updated_at = now()
    where organization_id = ${input.organizationId} and id = ${input.invoiceId}
      and amount_cents = ${input.amountCents} and status <> 'void'
    returning *`;
  if (!updated[0]) return null;

  await sql`insert into payment_events (
    id, organization_id, invoice_id, provider, provider_event_id, event_type, amount_cents, payload_fingerprint, created_at
  ) values (
    ${`payevt_${input.providerEventId}`}, ${input.organizationId}, ${input.invoiceId}, 'stripe', ${input.providerEventId},
    ${input.eventType}, ${input.amountCents}, ${input.payloadFingerprint}, now()
  ) on conflict (provider, provider_event_id) do nothing`;

  return mapInvoice(updated[0] as InvoiceRow);
}
