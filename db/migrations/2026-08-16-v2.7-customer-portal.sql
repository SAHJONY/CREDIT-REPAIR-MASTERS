-- v2.7 Customer Portal access mapping
-- Prepared in Neon migration 462889c4-78cc-4bbc-8a72-c1637cbd941a.
-- Do not apply to production without explicit migration approval.

ALTER TABLE app_users ADD CONSTRAINT app_users_organization_id_id_key UNIQUE (organization_id, id);

CREATE TABLE customer_client_access (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  client_id text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT customer_client_access_user_fk FOREIGN KEY (organization_id, user_id) REFERENCES app_users(organization_id, id) ON DELETE CASCADE,
  CONSTRAINT customer_client_access_client_fk FOREIGN KEY (organization_id, client_id) REFERENCES clients(organization_id, id) ON DELETE CASCADE,
  CONSTRAINT customer_client_access_one_client_per_user UNIQUE (organization_id, user_id),
  CONSTRAINT customer_client_access_one_user_per_client UNIQUE (organization_id, client_id)
);

CREATE INDEX customer_client_access_org_status_idx ON customer_client_access (organization_id, status);
