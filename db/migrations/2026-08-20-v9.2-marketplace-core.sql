create table if not exists marketplace_partners (
  id text primary key,
  organization_id text not null,
  name text not null,
  vertical text not null check (vertical in ('loans','auto','mortgage','business','marketplace')),
  status text not null default 'inactive' check (status in ('inactive','active','paused')),
  min_readiness integer not null default 0 check (min_readiness between 0 and 100),
  states jsonb not null default '[]'::jsonb,
  eligibility jsonb not null default '{}'::jsonb,
  disclosure text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marketplace_partners_org_vertical_idx on marketplace_partners (organization_id, vertical, status);

create table if not exists marketplace_handoffs (
  id text primary key,
  organization_id text not null,
  client_id text not null,
  partner_id text not null,
  vertical text not null check (vertical in ('loans','auto','mortgage','business','marketplace')),
  readiness_score integer not null check (readiness_score between 0 and 100),
  consent_recorded boolean not null default false,
  status text not null default 'created' check (status in ('created','sent','accepted','declined','expired')),
  source text not null default 'new850_marketplace',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marketplace_handoffs_org_client_idx on marketplace_handoffs (organization_id, client_id, created_at desc);
create index if not exists marketplace_handoffs_org_partner_idx on marketplace_handoffs (organization_id, partner_id, created_at desc);

create table if not exists marketplace_outcomes (
  id text primary key,
  organization_id text not null,
  handoff_id text not null,
  client_id text not null,
  partner_id text not null,
  outcome text not null check (outcome in ('pending','application_started','approved','funded','purchased','declined','withdrawn','unknown')),
  reported_by text not null,
  amount numeric(14,2),
  revenue_cents integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists marketplace_outcomes_org_created_idx on marketplace_outcomes (organization_id, created_at desc);
