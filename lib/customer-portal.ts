import { neon } from '@neondatabase/serverless';
import { redirect } from 'next/navigation';
import { getBusinessSession } from './session-access';
import { getPlatformStore } from './platform-store';
import type { ClientProfile } from './platform-types';

type CustomerAccessRow = {
  id: string;
  organization_id: string;
  user_id: string;
  client_id: string;
  status: 'active' | 'suspended';
};

export type CustomerPortalSession = {
  userId: string;
  memberId: string;
  email: string;
  organizationId: string;
  client: ClientProfile;
  accessId: string;
};

export async function getCustomerAccessByMember(organizationId: string, memberId: string): Promise<CustomerAccessRow | null> {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) return null;
  const sql = neon(databaseUrl);
  const rows = await sql`select id, organization_id, user_id, client_id, status from customer_client_access where organization_id = ${organizationId} and user_id = ${memberId} and status = 'active' limit 1`;
  return (rows[0] as CustomerAccessRow | undefined) ?? null;
}

export async function getCustomerPortalSession(): Promise<CustomerPortalSession | null> {
  const session = await getBusinessSession();
  if (!session || session.member.role !== 'client' || session.member.status !== 'active') return null;
  const access = await getCustomerAccessByMember(session.organizationId, session.member.id);
  if (!access) return null;
  const client = await getPlatformStore().getClient(session.organizationId, access.client_id);
  if (!client || client.organizationId !== session.organizationId) return null;
  return {
    userId: session.userId,
    memberId: session.member.id,
    email: session.email,
    organizationId: session.organizationId,
    client,
    accessId: access.id
  };
}

export async function requireCustomerPortalSession() {
  const portal = await getCustomerPortalSession();
  if (!portal) redirect('/portal/sign-in');
  return portal;
}

export function consentIsActive(consent: { granted: boolean; revokedAt?: string; expiresAt?: string }) {
  if (!consent.granted || consent.revokedAt) return false;
  return !consent.expiresAt || Date.parse(consent.expiresAt) > Date.now();
}
