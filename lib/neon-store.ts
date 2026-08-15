import { neon } from "@neondatabase/serverless";
import type { AgentRunRecord, AppUser, AuditRecord, ClientProfile, ConsentRecord, EvidenceRecord, Organization } from "./platform-types";
import type { PlatformStore } from "./platform-store";

function iso(value: unknown): string {
  return value instanceof Date ? value.toISOString() : new Date(String(value)).toISOString();
}

function assertTenant(expected: string, actual: string) {
  if (expected !== actual) throw new Error("TENANT_SCOPE_MISMATCH");
}

export class NeonPlatformStore implements PlatformStore {
  private readonly sql: ReturnType<typeof neon>;

  constructor(databaseUrl: string) {
    this.sql = neon(databaseUrl);
  }

  async getOrganization(id: string): Promise<Organization | null> {
    const rows = await this.sql`select id, name, mode, created_at from organizations where id = ${id} limit 1`;
    const row = rows[0] as Record<string, unknown> | undefined;
    return row ? { id: String(row.id), name: String(row.name), mode: row.mode as Organization["mode"], createdAt: iso(row.created_at) } : null;
  }

  async listUsers(organizationId: string): Promise<AppUser[]> {
    const rows = await this.sql`select id, organization_id, email, role, status, created_at from app_users where organization_id = ${organizationId} order by created_at desc`;
    return rows.map((row) => ({ id: String(row.id), organizationId: String(row.organization_id), email: String(row.email), role: row.role as AppUser["role"], status: row.status as AppUser["status"], createdAt: iso(row.created_at) }));
  }

  async listClients(organizationId: string): Promise<ClientProfile[]> {
    const rows = await this.sql`select id, organization_id, display_name, kind, state, status, created_at, updated_at from clients where organization_id = ${organizationId} order by updated_at desc`;
    return rows.map((row) => ({ id: String(row.id), organizationId: String(row.organization_id), displayName: String(row.display_name), kind: row.kind as ClientProfile["kind"], state: String(row.state), status: row.status as ClientProfile["status"], createdAt: iso(row.created_at), updatedAt: iso(row.updated_at) }));
  }

  async getClient(organizationId: string, id: string): Promise<ClientProfile | null> {
    const rows = await this.sql`select id, organization_id, display_name, kind, state, status, created_at, updated_at from clients where organization_id = ${organizationId} and id = ${id} limit 1`;
    const row = rows[0] as Record<string, unknown> | undefined;
    return row ? { id: String(row.id), organizationId: String(row.organization_id), displayName: String(row.display_name), kind: row.kind as ClientProfile["kind"], state: String(row.state), status: row.status as ClientProfile["status"], createdAt: iso(row.created_at), updatedAt: iso(row.updated_at) } : null;
  }

  async upsertClient(organizationId: string, client: ClientProfile): Promise<ClientProfile> {
    assertTenant(organizationId, client.organizationId);
    await this.sql`insert into clients (id, organization_id, display_name, kind, state, status, created_at, updated_at) values (${client.id}, ${organizationId}, ${client.displayName}, ${client.kind}, ${client.state}, ${client.status}, ${client.createdAt}, ${client.updatedAt}) on conflict (id) do update set display_name = excluded.display_name, kind = excluded.kind, state = excluded.state, status = excluded.status, updated_at = excluded.updated_at where clients.organization_id = ${organizationId}`;
    const persisted = await this.getClient(organizationId, client.id);
    if (!persisted) throw new Error("TENANT_SCOPED_UPSERT_REJECTED");
    return persisted;
  }

  async listConsents(organizationId: string, clientId: string): Promise<ConsentRecord[]> {
    const rows = await this.sql`select id, organization_id, client_id, scope, granted, source, granted_at, expires_at, revoked_at from consent_records where organization_id = ${organizationId} and client_id = ${clientId} order by granted_at desc`;
    return rows.map((row) => ({ id: String(row.id), organizationId: String(row.organization_id), clientId: String(row.client_id), scope: row.scope as ConsentRecord["scope"], granted: Boolean(row.granted), source: row.source as ConsentRecord["source"], grantedAt: iso(row.granted_at), expiresAt: row.expires_at ? iso(row.expires_at) : undefined, revokedAt: row.revoked_at ? iso(row.revoked_at) : undefined }));
  }

  async appendConsent(organizationId: string, record: ConsentRecord): Promise<void> {
    assertTenant(organizationId, record.organizationId);
    await this.sql`insert into consent_records (id, organization_id, client_id, scope, granted, source, granted_at, expires_at, revoked_at) values (${record.id}, ${organizationId}, ${record.clientId}, ${record.scope}, ${record.granted}, ${record.source}, ${record.grantedAt}, ${record.expiresAt ?? null}, ${record.revokedAt ?? null})`;
  }

  async listEvidence(organizationId: string, clientId: string): Promise<EvidenceRecord[]> {
    const rows = await this.sql`select id, organization_id, client_id, case_id, type, label, sha256, vault_ref, verification, created_at from evidence_records where organization_id = ${organizationId} and client_id = ${clientId} order by created_at desc`;
    return rows.map((row) => ({ id: String(row.id), organizationId: String(row.organization_id), clientId: String(row.client_id), caseId: row.case_id ? String(row.case_id) : undefined, type: row.type as EvidenceRecord["type"], label: String(row.label), sha256: row.sha256 ? String(row.sha256) : undefined, vaultRef: row.vault_ref ? String(row.vault_ref) : undefined, verification: row.verification as EvidenceRecord["verification"], createdAt: iso(row.created_at) }));
  }

  async appendEvidence(organizationId: string, record: EvidenceRecord): Promise<void> {
    assertTenant(organizationId, record.organizationId);
    await this.sql`insert into evidence_records (id, organization_id, client_id, case_id, type, label, sha256, vault_ref, verification, created_at) values (${record.id}, ${organizationId}, ${record.clientId}, ${record.caseId ?? null}, ${record.type}, ${record.label}, ${record.sha256 ?? null}, ${record.vaultRef ?? null}, ${record.verification}, ${record.createdAt})`;
  }

  async appendAudit(organizationId: string, record: AuditRecord): Promise<void> {
    assertTenant(organizationId, record.organizationId);
    await this.sql`insert into audit_records (id, organization_id, actor_type, actor_id, action, resource_type, resource_id, decision, metadata, created_at) values (${record.id}, ${organizationId}, ${record.actorType}, ${record.actorId}, ${record.action}, ${record.resourceType}, ${record.resourceId}, ${record.decision ?? null}, ${JSON.stringify(record.metadata ?? {})}::jsonb, ${record.createdAt})`;
  }

  async listAudit(organizationId: string, limit = 100): Promise<AuditRecord[]> {
    const safeLimit = Math.max(1, Math.min(limit, 500));
    const rows = await this.sql`select id, organization_id, actor_type, actor_id, action, resource_type, resource_id, decision, metadata, created_at from audit_records where organization_id = ${organizationId} order by created_at desc limit ${safeLimit}`;
    return rows.map((row) => ({ id: String(row.id), organizationId: String(row.organization_id), actorType: row.actor_type as AuditRecord["actorType"], actorId: String(row.actor_id), action: String(row.action), resourceType: String(row.resource_type), resourceId: String(row.resource_id), decision: row.decision ? row.decision as AuditRecord["decision"] : undefined, metadata: (row.metadata ?? {}) as AuditRecord["metadata"], createdAt: iso(row.created_at) }));
  }

  async appendAgentRun(organizationId: string, record: AgentRunRecord): Promise<void> {
    assertTenant(organizationId, record.organizationId);
    await this.sql`insert into agent_run_records (id, organization_id, client_id, agent, model, status, input_fingerprint, output_fingerprint, tool_calls, prompt_tokens, completion_tokens, created_at, completed_at) values (${record.id}, ${organizationId}, ${record.clientId ?? null}, ${record.agent}, ${record.model ?? null}, ${record.status}, ${record.inputFingerprint ?? null}, ${record.outputFingerprint ?? null}, ${record.toolCalls}, ${record.promptTokens ?? null}, ${record.completionTokens ?? null}, ${record.createdAt}, ${record.completedAt ?? null})`;
  }

  async listAgentRuns(organizationId: string, limit = 100): Promise<AgentRunRecord[]> {
    const safeLimit = Math.max(1, Math.min(limit, 500));
    const rows = await this.sql`select id, organization_id, client_id, agent, model, status, input_fingerprint, output_fingerprint, tool_calls, prompt_tokens, completion_tokens, created_at, completed_at from agent_run_records where organization_id = ${organizationId} order by created_at desc limit ${safeLimit}`;
    return rows.map((row) => ({ id: String(row.id), organizationId: String(row.organization_id), clientId: row.client_id ? String(row.client_id) : undefined, agent: String(row.agent), model: row.model ? String(row.model) : undefined, status: row.status as AgentRunRecord["status"], inputFingerprint: row.input_fingerprint ? String(row.input_fingerprint) : undefined, outputFingerprint: row.output_fingerprint ? String(row.output_fingerprint) : undefined, toolCalls: Number(row.tool_calls), promptTokens: row.prompt_tokens == null ? undefined : Number(row.prompt_tokens), completionTokens: row.completion_tokens == null ? undefined : Number(row.completion_tokens), createdAt: iso(row.created_at), completedAt: row.completed_at ? iso(row.completed_at) : undefined }));
  }
}

export async function checkNeonHealth(databaseUrl: string) {
  const sql = neon(databaseUrl);
  const rows = await sql`select 1 as ok, to_regclass('public.organizations') as organizations, to_regclass('public.clients') as clients, to_regclass('public.audit_records') as audit_records, to_regclass('public.agent_run_records') as agent_run_records`;
  const row = rows[0];
  const connected = Number(row?.ok) === 1;
  const schemaReady = connected && Boolean(row?.organizations && row?.clients && row?.audit_records && row?.agent_run_records);
  return { connected, schemaReady };
}
