create table if not exists loan_readiness_assessments (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  client_id text not null references clients(id) on delete cascade,
  goal text not null,
  readiness_score integer not null check (readiness_score between 0 and 100),
  status text not null,
  credit_score integer not null,
  utilization numeric(6,2) not null,
  monthly_income numeric(14,2) not null,
  monthly_debt numeric(14,2) not null,
  dti numeric(6,2) not null,
  on_time_payment_rate numeric(6,2) not null,
  derogatories integer not null,
  hard_inquiries integer not null,
  cash_reserves numeric(14,2) not null,
  reserve_months numeric(8,2) not null,
  roadmap jsonb not null default '[]'::jsonb,
  created_by text not null,
  created_at timestamptz not null default now()
);

create index if not exists loan_readiness_client_history_idx
  on loan_readiness_assessments (organization_id, client_id, created_at desc);

create index if not exists loan_readiness_org_recent_idx
  on loan_readiness_assessments (organization_id, created_at desc);
