import { getNeonAuth, neonAuthConfigured } from './auth/server';
import { configuredOrganizationId } from './api-auth';
import { getPlatformStore } from './platform-store';
import type { AppUser } from './platform-types';

export type BusinessSession = {
  userId: string;
  email: string;
  organizationId: string;
  member: AppUser;
};

export async function getBusinessSession(): Promise<BusinessSession | null> {
  if (!neonAuthConfigured()) return null;

  const result = await getNeonAuth().getSession();
  const data = result && typeof result === 'object' && 'data' in result
    ? (result as { data?: { user?: { id?: string; email?: string } } | null }).data
    : null;

  const id = data?.user?.id?.trim();
  const email = data?.user?.email?.trim().toLowerCase();
  if (!id || !email) return null;

  const organizationId = configuredOrganizationId();
  const members = await getPlatformStore().listUsers(organizationId);
  const member = members.find((candidate: AppUser) => candidate.status === 'active' && candidate.email.trim().toLowerCase() === email);
  if (!member) return null;

  return { userId: id, email, organizationId, member };
}
