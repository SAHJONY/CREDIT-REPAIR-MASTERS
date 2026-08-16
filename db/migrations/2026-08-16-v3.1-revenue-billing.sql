-- CREDIT REPAIR MASTERS OS v3.1 Revenue & Billing Engine
-- Idempotent PostgreSQL/Neon migration.

create table if not exists billing_invoices (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  client_id text not null,
  service_id text not null,
  milestone_label text not null,
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'usd' check (currency = 'usd'),
  status text not null check (status in ('open','checkout_pending','paid','void')),
  eligibility_decision text not null check (eligibility_decision in ('eligible','deferred','manual_review','blocked')),
  eligibility_snapshot jsonb not null,
  provider text,
  provider_session_id text,
  provider_payment_id text,
  checkout_url text,
  due_at timestamptz,
  paid_at timestamptz,
  created_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, client_id) references clients(organization_id, id) on delete cascade,
  unique (provider, provider_session_id)
);

create index if not exists billing_invoices_org_client_created_idx on billing_invoices (organization_id, client_id, created_at desc);
create index if not exists billing_invoices_org_status_idx on billing_invoices (organization_id, status, created_at desc);

create table if not exists payment_events (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  invoice_id text not null references billing_invoices(id) on delete cascade,
  provider text not null,
  provider_event_id text not null,
  event_type text not null,
  amount_cents integer,
  payload_fingerprint text not null,
  created_at timestamptz not null default now(),
  unique (provider, provider_event_id)
);

create index if not exists payment_events_org_invoice_created_idx on payment_events (organization_id, invoice_id, created_at desc);
