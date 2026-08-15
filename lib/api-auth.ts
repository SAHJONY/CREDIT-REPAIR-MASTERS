import { timingSafeEqual } from "node:crypto";

export type OperatorAuthResult =
  | { ok: true; actorId: string; organizationId: string; mode: "token" | "demo" }
  | { ok: false; status: 401 | 403 | 503; error: string };

function environment() {
  return (globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
}

function bearerToken(request: Request): string | null {
  const authorization = request.headers.get("authorization");
  if (authorization?.toLowerCase().startsWith("bearer ")) return authorization.slice(7).trim();
  return request.headers.get("x-credit-os-token")?.trim() || null;
}

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left, "utf8");
  const b = Buffer.from(right, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function authenticateOperator(request: Request): OperatorAuthResult {
  const env = environment();
  const expected = env.CREDIT_OS_API_TOKEN;
  const configuredOrganizationId = env.CREDIT_OS_ORGANIZATION_ID?.trim();
  const isProduction = env.VERCEL_ENV === "production" || env.APP_ENV === "production";

  if (!expected) {
    if (isProduction) return { ok: false, status: 503, error: "OPERATOR_AUTH_NOT_CONFIGURED" };
    return { ok: true, actorId: "demo-operator", organizationId: "org_demo", mode: "demo" };
  }

  if (isProduction && !configuredOrganizationId) {
    return { ok: false, status: 503, error: "OPERATOR_ORGANIZATION_NOT_CONFIGURED" };
  }

  const supplied = bearerToken(request);
  if (!supplied) return { ok: false, status: 401, error: "OPERATOR_AUTH_REQUIRED" };
  if (!safeEqual(supplied, expected)) return { ok: false, status: 403, error: "OPERATOR_AUTH_INVALID" };

  const actorHeader = request.headers.get("x-credit-os-actor")?.trim();
  const actorId = actorHeader && /^[a-zA-Z0-9._:@-]{1,128}$/.test(actorHeader) ? actorHeader : "operator-token";
  return {
    ok: true,
    actorId,
    organizationId: configuredOrganizationId || "org_demo",
    mode: "token"
  };
}
