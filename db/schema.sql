-- CREDIT REPAIR MASTERS OS v1.3 production schema (PostgreSQL/Neon compatible)
-- Apply only after production database provisioning and backup policy are approved.
-- Tenant integrity is enforced with composite organization/client foreign keys.

create table if not exists organizations (
  id text primary key,
  name text not null,
  mode text not null check (mode in ('demo','production')),
  created_at timestamptz not null default now()
);

create table if not exists app_users (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  email text not null,
  role text not null check (role in ('owner','admin','credit_specialist','compliance_reviewer','client','auditor')),
  status text not null default 'active' check (status in ('active','suspended')),
  created_at timestamptz not null default now(),
  unique (organization_id, email)
);

create table if not exists clients (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  display_name text not null,
  kind text not null check (kind in ('consumer','business')),
  state text not null,
  status text not null check (status in ('onboarding','active','paused','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id)
);

create table if not exists consent_records (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  client_id text not null,
  scope text not null check (scope in ('credit_report_analysis','dispute_drafting','dispute_submission','financial_action','new_credit','identity_theft_workflow')),
  granted boolean not null,
  source text not null check (source in ('client_portal','staff_recorded','api')),
  granted_at timestamptz not null,
  expires_at timestamptz,
  revoked_at timestamptz,
  foreign key (organization_id, client_id) references clients(organization_id, id) on delete cascade
);

create table if not exists evidence_records (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  client_id text not null,
  case_id text,
  type text not null check (type in ('credit_report','statement','payment_record','identity_document','correspondence','other')),
  label text not null,
  sha256 text,
  vault_ref text,
  verification text not null check (verification in ('unverified','verified','rejected')),
  created_at timestamptz not null default now(),
  foreign key (organization_id, client_id) references clients(organization_id, id) on delete cascade
);

create index if not exists evidence_org_client_case_idx on evidence_records (organization_id, client_id, case_id);
create index if not exists consent_org_client_idx on consent_records (organization_id, client_id, granted_at desc);

create table if not exists audit_records (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  actor_type text not null check (actor_type in ('user','agent','system')),
  actor_id text not null,
  action text not null,
  resource_type text not null,
  resource_id text not null,
  decision text check (decision is null or decision in ('allowed','approval_required','blocked')),
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_org_created_idx on audit_records (organization_id, created_at desc);

create table if not exists agent_run_records (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  client_id text,
  agent text not null,
  model text,
  status text not null check (status in ('started','completed','failed','fallback')),
  input_fingerprint text,
  output_fingerprint text,
  tool_calls integer not null default 0 check (tool_calls >= 0),
  prompt_tokens integer check (prompt_tokens is null or prompt_tokens >= 0),
  completion_tokens integer check (completion_tokens is null or completion_tokens >= 0),
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  foreign key (organization_id, client_id) references clients(organization_id, id) on delete cascade
);

create index if not exists agent_runs_org_created_idx on agent_run_records (organization_id, created_at desc);

-- NOTE: Row Level Security should be enabled together with a connection-scoped
-- organization context in the Neon adapter. Do not enable RLS independently of
-- that adapter contract or production requests will fail closed by design.
