create table if not exists public.growth_leads (
  id text primary key,
  organization_id text not null references public.organizations(id) on delete cascade,
  identity_key text not null,
  name text not null,
  email text not null,
  phone text,
  state text not null,
  service_id text not null,
  service_name text not null,
  audience text not null,
  goal text not null,
  source text not null default 'direct',
  medium text not null default '',
  campaign text not null default '',
  delivery_channel text not null default 'owner-inbox',
  status text not null default 'new',
  is_test boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists growth_leads_org_recent_idx
  on public.growth_leads (organization_id, created_at desc);

create index if not exists growth_leads_identity_idx
  on public.growth_leads (organization_id, identity_key, created_at desc);
