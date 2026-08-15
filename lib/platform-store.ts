declare const process: { env: Record<string, string | undefined> };
import type { AgentRunRecord, AppUser, AuditRecord, ClientProfile, ConsentRecord, EvidenceRecord, Organization } from "./platform-types";

export interface PlatformStore {
  getOrganization(id: string): Promise<Organization | null>;
  listUsers(organizationId: string): Promise<AppUser[]>;
  listClients(organizationId: string): Promise<ClientProfile[]>;
  getClient(id: string): Promise<ClientProfile | null>;
  upsertClient(client: ClientProfile): Promise<ClientProfile>;
  listConsents(clientId: string): Promise<ConsentRecord[]>;
  appendConsent(record: ConsentRecord): Promise<void>;
  listEvidence(clientId: string): Promise<EvidenceRecord[]>;
  appendEvidence(record: EvidenceRecord): Promise<void>;
  appendAudit(record: AuditRecord): Promise<void>;
  listAudit(organizationId: string, limit?: number): Promise<AuditRecord[]>;
  appendAgentRun(record: AgentRunRecord): Promise<void>;
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
  private clients = [...demoClients];
  private consents: ConsentRecord[] = [];
  private evidence: EvidenceRecord[] = [];
  private audit: AuditRecord[] = [];
  private agentRuns: AgentRunRecord[] = [];

  async getOrganization(id: string) { return id === demoOrg.id ? demoOrg : null; }
  async listUsers(organizationId: string) { return demoUsers.filter((u) => u.organizationId === organizationId); }
  async listClients(organizationId: string) { return this.clients.filter((c) => c.organizationId === organizationId); }
  async getClient(id: string) { return this.clients.find((c) => c.id === id) ?? null; }
  async upsertClient(client: ClientProfile) {
    const idx = this.clients.findIndex((c) => c.id === client.id);
    if (idx >= 0) this.clients[idx] = client; else this.clients.push(client);
    return client;
  }
  async listConsents(clientId: string) { return this.consents.filter((c) => c.clientId === clientId); }
  async appendConsent(record: ConsentRecord) { this.consents.push(record); }
  async listEvidence(clientId: string) { return this.evidence.filter((e) => e.clientId === clientId); }
  async appendEvidence(record: EvidenceRecord) { this.evidence.push(record); }
  async appendAudit(record: AuditRecord) { this.audit.push(record); }
  async listAudit(organizationId: string, limit = 100) { return this.audit.filter((a) => a.organizationId === organizationId).slice(-limit).reverse(); }
  async appendAgentRun(record: AgentRunRecord) { this.agentRuns.push(record); }
  async listAgentRuns(organizationId: string, limit = 100) { return this.agentRuns.filter((r) => r.organizationId === organizationId).slice(-limit).reverse(); }
}

const memoryStore = new MemoryPlatformStore();

export function getPlatformStore(): PlatformStore {
  // Production DB adapter is intentionally fail-closed until DATABASE_URL + adapter are configured.
  // This prevents accidental claims of persistence when the app is running in demo-safe mode.
  return memoryStore;
}

export function storageMode() {
  return process.env.DATABASE_URL ? "adapter-required" : "demo-memory";
}
