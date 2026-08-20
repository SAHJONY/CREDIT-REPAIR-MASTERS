import { neon } from '@neondatabase/serverless';
import { isProductionEnvironment } from './platform-store';
import type { New850VerticalId } from './new850-platform';

declare const process: { env: Record<string, string | undefined> };

export type MarketplacePartner = {
  id: string;
  organizationId: string;
  name: string;
  vertical: New850VerticalId;
  status: 'inactive' | 'active' | 'paused';
  minReadiness: number;
  states: string[];
  eligibility: Record<string, string | number | boolean | null>;
  disclosure: string;
  createdAt: string;
  updatedAt: string;
};

export type MarketplaceHandoff = {
  id: string;
  organizationId: string;
  clientId: string;
  partnerId: string;
  vertical: New850VerticalId;
  readinessScore: number;
  consentRecorded: boolean;
  status: 'created' | 'sent' | 'accepted' | 'declined' | 'expired';
  source: string;
  metadata: Record<string, string | number | boolean | null>;
  createdAt: string;
  updatedAt: string;
};

export type MarketplaceOutcome = {
  id: string;
  organizationId: string;
  handoffId: string;
  clientId: string;
  partnerId: string;
  outcome: 'pending' | 'application_started' | 'approved' | 'funded' | 'purchased' | 'declined' | 'withdrawn' | 'unknown';
  reportedBy: string;
  amount?: number;
  revenueCents?: number;
  metadata: Record<string, string | number | boolean | null>;
  createdAt: string;
};

const memoryPartners: MarketplacePartner[] = [];
const memoryHandoffs: MarketplaceHandoff[] = [];
const memoryOutcomes: MarketplaceOutcome[] = [];

function database() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    if (isProductionEnvironment()) throw new Error('PRODUCTION_DATABASE_NOT_CONFIGURED');
    return null;
  }
  return neon(url);
}

function isMarketplaceSchemaMissing(error: unknown) {
  if (!error || typeof error !== 'object') return false;
  const candidate = error as { code?: string; message?: string };
  return candidate.code === '42P01' || Boolean(candidate.message?.includes('marketplace_') && candidate.message?.includes('does not exist'));
}

function marketplaceSchemaRequired(error: unknown): never {
  if (isMarketplaceSchemaMissing(error)) throw new Error('MARKETPLACE_SCHEMA_MIGRATION_REQUIRED');
  throw error;
}

function partnerFromRow(row: Record<string, unknown>): MarketplacePartner {
  return {
    id: String(row.id), organizationId: String(row.organization_id), name: String(row.name),
    vertical: row.vertical as New850VerticalId,
    status: row.status as MarketplacePartner['status'], minReadiness: Number(row.min_readiness),
    states: Array.isArray(row.states) ? row.states.map(String) : [],
    eligibility: (row.eligibility && typeof row.eligibility === 'object' ? row.eligibility : {}) as MarketplacePartner['eligibility'],
    disclosure: String(row.disclosure || ''),
    createdAt: new Date(String(row.created_at)).toISOString(), updatedAt: new Date(String(row.updated_at)).toISOString()
  };
}

function handoffFromRow(row: Record<string, unknown>): MarketplaceHandoff {
  return {
    id: String(row.id), organizationId: String(row.organization_id), clientId: String(row.client_id), partnerId: String(row.partner_id),
    vertical: row.vertical as New850VerticalId, readinessScore: Number(row.readiness_score), consentRecorded: Boolean(row.consent_recorded),
    status: row.status as MarketplaceHandoff['status'], source: String(row.source),
    metadata: (row.metadata && typeof row.metadata === 'object' ? row.metadata : {}) as MarketplaceHandoff['metadata'],
    createdAt: new Date(String(row.created_at)).toISOString(), updatedAt: new Date(String(row.updated_at)).toISOString()
  };
}

function outcomeFromRow(row: Record<string, unknown>): MarketplaceOutcome {
  return {
    id: String(row.id), organizationId: String(row.organization_id), handoffId: String(row.handoff_id), clientId: String(row.client_id), partnerId: String(row.partner_id),
    outcome: row.outcome as MarketplaceOutcome['outcome'], reportedBy: String(row.reported_by),
    amount: row.amount == null ? undefined : Number(row.amount), revenueCents: row.revenue_cents == null ? undefined : Number(row.revenue_cents),
    metadata: (row.metadata && typeof row.metadata === 'object' ? row.metadata : {}) as MarketplaceOutcome['metadata'],
    createdAt: new Date(String(row.created_at)).toISOString()
  };
}

export async function listMarketplacePartners(organizationId: string, vertical?: New850VerticalId) {
  const sql = database();
  if (!sql) return memoryPartners.filter((p) => p.organizationId === organizationId && (!vertical || p.vertical === vertical));
  try {
    const rows = vertical
      ? await sql`select * from marketplace_partners where organization_id = ${organizationId} and vertical = ${vertical} order by name asc`
      : await sql`select * from marketplace_partners where organization_id = ${organizationId} order by vertical asc, name asc`;
    return rows.map((row) => partnerFromRow(row as Record<string, unknown>));
  } catch (error) {
    if (isMarketplaceSchemaMissing(error)) return [];
    throw error;
  }
}

export async function listEligibleMarketplacePartners(organizationId: string, vertical: New850VerticalId, readinessScore: number, state?: string) {
  const partners = await listMarketplacePartners(organizationId, vertical);
  return partners
    .filter((partner) => partner.status === 'active')
    .filter((partner) => readinessScore >= partner.minReadiness)
    .filter((partner) => !state || partner.states.length === 0 || partner.states.includes(state))
    .sort((a, b) => a.minReadiness - b.minReadiness || a.name.localeCompare(b.name));
}

export async function upsertMarketplacePartner(organizationId: string, partner: MarketplacePartner) {
  if (partner.organizationId !== organizationId) throw new Error('TENANT_SCOPE_MISMATCH');
  const sql = database();
  if (!sql) {
    const index = memoryPartners.findIndex((p) => p.organizationId === organizationId && p.id === partner.id);
    if (index >= 0) memoryPartners[index] = partner; else memoryPartners.push(partner);
    return partner;
  }
  try {
    await sql`insert into marketplace_partners (id, organization_id, name, vertical, status, min_readiness, states, eligibility, disclosure, created_at, updated_at)
      values (${partner.id}, ${organizationId}, ${partner.name}, ${partner.vertical}, ${partner.status}, ${partner.minReadiness}, ${JSON.stringify(partner.states)}::jsonb, ${JSON.stringify(partner.eligibility)}::jsonb, ${partner.disclosure}, ${partner.createdAt}, ${partner.updatedAt})
      on conflict (id) do update set name = excluded.name, vertical = excluded.vertical, status = excluded.status, min_readiness = excluded.min_readiness,
        states = excluded.states, eligibility = excluded.eligibility, disclosure = excluded.disclosure, updated_at = excluded.updated_at`;
    return partner;
  } catch (error) {
    return marketplaceSchemaRequired(error);
  }
}

export async function appendMarketplaceHandoff(organizationId: string, handoff: MarketplaceHandoff) {
  if (handoff.organizationId !== organizationId) throw new Error('TENANT_SCOPE_MISMATCH');
  if (!handoff.consentRecorded) throw new Error('MARKETPLACE_HANDOFF_REQUIRES_CONSENT');
  const sql = database();
  if (!sql) { memoryHandoffs.push(handoff); return handoff; }
  try {
    await sql`insert into marketplace_handoffs (id, organization_id, client_id, partner_id, vertical, readiness_score, consent_recorded, status, source, metadata, created_at, updated_at)
      values (${handoff.id}, ${organizationId}, ${handoff.clientId}, ${handoff.partnerId}, ${handoff.vertical}, ${handoff.readinessScore}, ${handoff.consentRecorded}, ${handoff.status}, ${handoff.source}, ${JSON.stringify(handoff.metadata)}::jsonb, ${handoff.createdAt}, ${handoff.updatedAt})`;
    return handoff;
  } catch (error) {
    return marketplaceSchemaRequired(error);
  }
}

export async function listMarketplaceHandoffs(organizationId: string, limit = 100) {
  const safeLimit = Math.max(1, Math.min(limit, 250));
  const sql = database();
  if (!sql) return memoryHandoffs.filter((h) => h.organizationId === organizationId).slice(-safeLimit).reverse();
  try {
    const rows = await sql`select * from marketplace_handoffs where organization_id = ${organizationId} order by created_at desc limit ${safeLimit}`;
    return rows.map((row) => handoffFromRow(row as Record<string, unknown>));
  } catch (error) {
    if (isMarketplaceSchemaMissing(error)) return [];
    throw error;
  }
}

export async function appendMarketplaceOutcome(organizationId: string, outcome: MarketplaceOutcome) {
  if (outcome.organizationId !== organizationId) throw new Error('TENANT_SCOPE_MISMATCH');
  const sql = database();
  if (!sql) { memoryOutcomes.push(outcome); return outcome; }
  try {
    await sql`insert into marketplace_outcomes (id, organization_id, handoff_id, client_id, partner_id, outcome, reported_by, amount, revenue_cents, metadata, created_at)
      values (${outcome.id}, ${organizationId}, ${outcome.handoffId}, ${outcome.clientId}, ${outcome.partnerId}, ${outcome.outcome}, ${outcome.reportedBy}, ${outcome.amount ?? null}, ${outcome.revenueCents ?? null}, ${JSON.stringify(outcome.metadata)}::jsonb, ${outcome.createdAt})`;
    return outcome;
  } catch (error) {
    return marketplaceSchemaRequired(error);
  }
}

export async function listMarketplaceOutcomes(organizationId: string, limit = 100) {
  const safeLimit = Math.max(1, Math.min(limit, 250));
  const sql = database();
  if (!sql) return memoryOutcomes.filter((o) => o.organizationId === organizationId).slice(-safeLimit).reverse();
  try {
    const rows = await sql`select * from marketplace_outcomes where organization_id = ${organizationId} order by created_at desc limit ${safeLimit}`;
    return rows.map((row) => outcomeFromRow(row as Record<string, unknown>));
  } catch (error) {
    if (isMarketplaceSchemaMissing(error)) return [];
    throw error;
  }
}
