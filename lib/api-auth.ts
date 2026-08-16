import { timingSafeEqual } from "node:crypto";
import { getNeonAuth, neonAuthConfigured } from "./auth/server";
import { hasMfaAssurance } from "./mfa";
import { getPlatformStore } from "./platform-store";
import type { Role } from "./platform-types";

const DEFAULT_PRODUCTION_ORG = "org_credit_repair_masters";

export type OperatorAuthResult =
  | { ok: true; actorId: string; organizationId: string; mode: "session" | "token" | "demo"; role: Role }
  | { ok: false; status: 401 | 403 | 503; error: string };

function environment() {
  return (globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
}

function bearerToken(request: Request): string | null {
  const authorization = request.headers.get("authorization");
  if (authorization?.toLowerCase().startsWith("bearer ")) return authorization.slice(7).trim();
  return request.headers.get("x-credit-os-token")?.trim() || null;
}

function cookieValue(request: Request, name: string): string | null {
  const cookie = request.headers.get('cookie') || '';
  for (const part of cookie.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return null;
}

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left, "utf8");
  const b = Buffer.from(right, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function configuredOrganizationId() {
  const env = environment();
  const isProduction = env.VERCEL_ENV === "production" || env.APP_ENV === "production";
  return env.CREDIT_OS_ORGANIZATION_ID?.trim() || (isProduction ? DEFAULT_PRODUCTION_ORG : "org_demo");
}

export function authenticateOperator(request: Request): OperatorAuthResult {
  const env = environment();
  const expected = env.CREDIT_OS_API_TOKEN;
  const isProduction = env.VERCEL_ENV === "production" || env.APP_ENV === "production";

  if (!expected) {
    if (isProduction) return { ok: false, status: 503, error: "OPERATOR_AUTH_NOT_CONFIGURED" };
    return { ok: true, actorId: "demo-operator", organizationId: "org_demo", mode: "demo", role: "owner" };
  }

  const supplied = bearerToken(request);
  if (!supplied) return { ok: false, status: 401, error: "OPERATOR_AUTH_REQUIRED" };
  if (!safeEqual(supplied, expected)) return { ok: false, status: 403, error: "OPERATOR_AUTH_INVALID" };

  const actorHeader = request.headers.get("x-credit-os-actor")?.trim();
  const actorId = actorHeader && /^[a-zA-Z0-9._:@-]{1,128}$/.test(actorHeader) ? actorHeader : "operator-token";
  return {
    ok: true,
    actorId,
    organizationId: configuredOrganizationId(),
    mode: "token",
    role: "owner"
  };
}

function sessionUser(data: unknown): { id: string; email: string } | null {
  if (!data || typeof data !== "object") return null;
  const candidate = data as { user?: unknown };
  if (!candidate.user || typeof candidate.user !== "object") return null;
  const user = candidate.user as { id?: unknown; email?: unknown };
  if (typeof user.id !== "string" || typeof user.email !== "string") return null;
  const id = user.id.trim();
  const email = user.email.trim().toLowerCase();
  return id && email ? { id, email } : null;
}

export async function authenticateBusinessUser(request: Request): Promise<OperatorAuthResult> {
  const env = environment();
  const suppliedToken = bearerToken(request);
  const expectedToken = env.CREDIT_OS_API_TOKEN?.trim();

  if (neonAuthConfigured()) {
    try {
      const result = await getNeonAuth().getSession();
      const data = result && typeof result === "object" && "data" in result
        ? (result as { data?: unknown }).data
        : null;
      const session = sessionUser(data);

      if (session) {
        const organizationId = configuredOrganizationId();
        const users = await getPlatformStore().listUsers(organizationId);
        const member = users.find((user) => user.status === "active" && user.email.trim().toLowerCase() === session.email);
        if (!member) return { ok: false, status: 403, error: "AUTH_MEMBERSHIP_REQUIRED" };

        if (member.role === 'owner' || member.role === 'admin') {
          const assured = await hasMfaAssurance({ organizationId, userId: member.id, token: cookieValue(request, 'crm_mfa') });
          if (!assured) return { ok: false, status: 403, error: 'MFA_REQUIRED' };
        }

        return {
          ok: true,
          actorId: member.id || session.id,
          organizationId,
          mode: "session",
          role: member.role
        };
      }
    } catch {
      if (!(suppliedToken && expectedToken)) {
        return { ok: false, status: 503, error: "AUTH_SESSION_UNAVAILABLE" };
      }
    }

    if (!(suppliedToken || expectedToken)) {
      return { ok: false, status: 401, error: "AUTH_SESSION_REQUIRED" };
    }
  }

  return authenticateOperator(request);
}

export function authorizeRoles(auth: OperatorAuthResult, roles: readonly Role[]): OperatorAuthResult {
  if (!auth.ok) return auth;
  if (!roles.includes(auth.role)) return { ok: false, status: 403, error: "ROLE_NOT_AUTHORIZED" };
  return auth;
}
