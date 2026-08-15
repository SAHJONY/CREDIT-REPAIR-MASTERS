-- CREDIT REPAIR MASTERS OS v0.5 production schema (PostgreSQL/Neon compatible)
-- Apply only after production database provisioning and backup policy are approved.

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
  role text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  unique (organization_id, email)
);

create table if not exists clients (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  display_name text not null,
  kind text not null check (kind in ('consumer','business')),
  state text not null,
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists consent_records (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  client_id text not null references clients(id) on delete cascade,
  scope text not null,
  granted boolean not null,
  source text not null,
  granted_at timestamptz not null,
  expires_at timestamptz,
  revoked_at timestamptz
);

create table if not exists evidence_records (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  client_id text not null references clients(id) on delete cascade,
  case_id text,
  type text not null,
  label text not null,
  sha256 text,
  vault_ref text,
  verification text not null,
  created_at timestamptz not null default now()
);

create table if not exists audit_records (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  actor_type text not null,
  actor_id text not null,
  action text not null,
  resource_type text not null,
  resource_id text not null,
  decision text,
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
  status text not null,
  input_fingerprint text,
  output_fingerprint text,
  tool_calls integer not null default 0,
  prompt_tokens integer,
  completion_tokens integer,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists agent_runs_org_created_idx on agent_run_records (organization_id, created_at desc);
