import { neon } from '@neondatabase/serverless';
import type { GrowthLeadNotification } from './growth-leads';

declare const process: { env: Record<string, string | undefined> };

export type StoredGrowthLead = GrowthLeadNotification & {
  organizationId: string;
  identityKey: string;
  deliveryChannel: string;
  status: string;
  isTest: boolean;
  createdAt: string;
};

function sqlClient() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) throw new Error('DATABASE_URL_NOT_CONFIGURED');
  return neon(url);
}

export async function persistGrowthLead(
  organizationId: string,
  identityKey: string,
  lead: GrowthLeadNotification,
  deliveryChannel: string,
  isTest = false
) {
  const sql = sqlClient();
  await sql`
    insert into public.growth_leads (
      id, organization_id, identity_key, name, email, phone, state,
      service_id, service_name, audience, goal, source, medium, campaign,
      delivery_channel, status, is_test
    ) values (
      ${lead.reference}, ${organizationId}, ${identityKey}, ${lead.name}, ${lead.email},
      ${lead.phone || null}, ${lead.state}, ${lead.serviceId}, ${lead.serviceName},
      ${lead.audience}, ${lead.goal}, ${lead.source}, ${lead.medium}, ${lead.campaign},
      ${deliveryChannel}, ${isTest ? 'test' : 'new'}, ${isTest}
    )
    on conflict (id) do nothing
  `;
}

export async function updateGrowthLeadDeliveryChannel(reference: string, organizationId: string, channel: string) {
  const sql = sqlClient();
  await sql`
    update public.growth_leads
    set delivery_channel = ${channel}
    where id = ${reference} and organization_id = ${organizationId}
  `;
}

export async function listGrowthLeads(organizationId: string, limit = 50): Promise<StoredGrowthLead[]> {
  const sql = sqlClient();
  const safeLimit = Math.max(1, Math.min(limit, 100));
  const rows = await sql`
    select id, organization_id, identity_key, name, email, phone, state,
           service_id, service_name, audience, goal, source, medium, campaign,
           delivery_channel, status, is_test, created_at
    from public.growth_leads
    where organization_id = ${organizationId}
    order by created_at desc
    limit ${safeLimit}
  `;
  return rows.map((row) => ({
    reference: String(row.id),
    organizationId: String(row.organization_id),
    identityKey: String(row.identity_key),
    name: String(row.name),
    email: String(row.email),
    phone: row.phone ? String(row.phone) : undefined,
    state: String(row.state),
    serviceId: String(row.service_id),
    serviceName: String(row.service_name),
    audience: String(row.audience),
    goal: String(row.goal),
    source: String(row.source),
    medium: String(row.medium),
    campaign: String(row.campaign),
    deliveryChannel: String(row.delivery_channel),
    status: String(row.status),
    isTest: Boolean(row.is_test),
    createdAt: new Date(String(row.created_at)).toISOString()
  }));
}
