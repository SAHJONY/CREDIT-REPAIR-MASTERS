-- CREDIT REPAIR MASTERS OS v2.9 payment ledger
-- Prepared migration only. Apply to production only after explicit migration approval.

create table if not exists payment_ledger (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  client_id text not null,
  service_id text not null,
  provider text not null check (provider in ('square','stripe','paypal','authorize_net','adyen','zelle')),
  method text not null check (method in ('debit_card','credit_card','cash_app_pay','paypal','apple_pay','google_pay','zelle')),
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'USD' check (currency = 'USD'),
  status text not null check (status in ('pending','reported','authorized','paid','failed','void','refunded')),
  provider_reference text,
  customer_reference text,
  metadata jsonb,
  verified_by text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, client_id) references clients(organization_id, id) on delete cascade,
  foreign key (organization_id, verified_by) references app_users(organization_id, id) on delete set null
);

create index if not exists payment_ledger_org_client_created_idx on payment_ledger (organization_id, client_id, created_at desc);
create index if not exists payment_ledger_org_status_idx on payment_ledger (organization_id, status, created_at desc);
create unique index if not exists payment_ledger_provider_reference_uq on payment_ledger (provider, provider_reference) where provider_reference is not null;
