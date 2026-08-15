declare const process: { env: Record<string, string | undefined> };
import type { AgentRunRecord, AppUser, AuditRecord, ClientProfile, ConsentRecord, EvidenceRecord, Organization } from "./platform-types";
import { NeonPlatformStore } from "./neon-store";

export interface PlatformStore {
  getOrganization(id: string): Promise<Organization | null>;
  upsertOrganization(organization: Organization): Promise<Organization>;
  listUsers(organizationId: string): Promise<AppUser[]>;
  listClients(organizationId: string): Promise<ClientProfile[]>;
  getClient(organizationId: string, id: string): Promise<ClientProfile | null>;
  upsertClient(organizationId: string, client: ClientProfile): Promise<ClientProfile>;
  listConsents(organizationId: string, clientId: string): Promise<ConsentRecord[]>;
  appendConsent(organizationId: string, record: ConsentRecord): Promise<void>;
  listEvidence(organizationId: string, clientId: string): Promise<EvidenceRecord[]>;
  appendEvidence(organizationId: string, record: EvidenceRecord): Promise<void>;
  appendAudit(organizationId: string, record: AuditRecord): Promise<void>;
  listAudit(organizationId: string, limit?: number): Promise<AuditRecord[]>;
  appendAgentRun(organizationId: string, record: AgentRunRecord): Promise<void>;
  listAgentRuns(organizationId: string, limit?: number): Promise<AgentRunRecord[]>;
}

const now = new Date().toISOString();
const demoOrg: Organization = { id: "org_demo", name: "CREDIT REPAIR MASTERS", mode: "demo", createdAt: now };
const demoUsers: AppUser[] = [
  { id: "usr_owner", organizationId: demoOrg.id, email: "owner@example.invalid", role: "owner", status: "active", createdAt: now },
  { id: "usr_compliance", organizationId: demoOrg.id, email: "compliance@example.invalid", role: "compliance_reviewer", status: "active", createdAt: now }
];
const demoClients: ClientProfile[] = [
  { id: "client_demo", organizationId: demoOrg.id, displayName: "Demo Consumer", kind: "consumer", state: "FL", status: "active", createdAt: now, updatedAt: now }
];

class MemoryPlatformStore implements PlatformStore {
  private organization = demoOrg;
  private clients = [...demoClients];
  private consents: ConsentRecord[] = [];
  private evidence: EvidenceRecord[] = [];
  private audit: AuditRecord[] = [];
  private agentRuns: AgentRunRecord[] = [];

  async getOrganization(id: string) { return id === this.organization.id ? this.organization : null; }
  async upsertOrganization(organization: Organization) { this.organization = organization; return organization; }
  async listUsers(organizationId: string) { return demoUsers.filter((u) => u.organizationId === organizationId); }
  async listClients(organizationId: string) { return this.clients.filter((c) => c.organizationId === organizationId); }
  async getClient(organizationId: string, id: string) { return this.clients.find((c) => c.organizationId === organizationId && c.id === id) ?? null; }
  async upsertClient(organizationId: string, client: ClientProfile) {
    if (organizationId !== client.organizationId) throw new Error("TENANT_SCOPE_MISMATCH");
    const idx = this.clients.findIndex((c) => c.organizationId === organizationId && c.id === client.id);
    if (idx >= 0) this.clients[idx] = client; else this.clients.push(client);
    return client;
  }
  async listConsents(organizationId: string, clientId: string) { return this.consents.filter((c) => c.organizationId === organizationId && c.clientId === clientId); }
  async appendConsent(organizationId: string, record: ConsentRecord) { if (organizationId !== record.organizationId) throw new Error("TENANT_SCOPE_MISMATCH"); this.consents.push(record); }
  async listEvidence(organizationId: string, clientId: string) { return this.evidence.filter((e) => e.organizationId === organizationId && e.clientId === clientId); }
  async appendEvidence(organizationId: string, record: EvidenceRecord) { if (organizationId !== record.organizationId) throw new Error("TENANT_SCOPE_MISMATCH"); this.evidence.push(record); }
  async appendAudit(organizationId: string, record: AuditRecord) { if (organizationId !== record.organizationId) throw new Error("TENANT_SCOPE_MISMATCH"); this.audit.push(record); }
  async listAudit(organizationId: string, limit = 100) { return this.audit.filter((a) => a.organizationId === organizationId).slice(-limit).reverse(); }
  async appendAgentRun(organizationId: string, record: AgentRunRecord) { if (organizationId !== record.organizationId) throw new Error("TENANT_SCOPE_MISMATCH"); this.agentRuns.push(record); }
  async listAgentRuns(organizationId: string, limit = 100) { return this.agentRuns.filter((r) => r.organizationId === organizationId).slice(-limit).reverse(); }
}

const memoryStore = new MemoryPlatformStore();
let neonStore: NeonPlatformStore | null = null;

export function isProductionEnvironment(): boolean {
  return process.env.VERCEL_ENV === "production" || process.env.APP_ENV === "production";
}

export function getPlatformStore(): PlatformStore {
  const url = process.env.DATABASE_URL;
  if (!url) {
    if (isProductionEnvironment()) throw new Error("PRODUCTION_DATABASE_NOT_CONFIGURED");
    return memoryStore;
  }
  if (!neonStore) neonStore = new NeonPlatformStore(url);
  return neonStore;
}

export function storageMode() {
  if (process.env.DATABASE_URL) return "neon-postgres";
  return isProductionEnvironment() ? "unavailable" : "demo-memory";
}
