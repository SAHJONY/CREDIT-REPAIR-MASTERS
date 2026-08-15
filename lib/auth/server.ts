import { createNeonAuth } from "@neondatabase/auth/next/server";

function authBaseUrl() {
  return process.env.NEON_AUTH_BASE_URL?.trim() || process.env.VITE_NEON_AUTH_URL?.trim() || "";
}

function authCookieSecret() {
  return process.env.NEON_AUTH_COOKIE_SECRET?.trim() || process.env.AUTH_SECRET?.trim() || "";
}

export function neonAuthConfigured() {
  return Boolean(authBaseUrl() && authCookieSecret());
}

export function getNeonAuth() {
  const baseUrl = authBaseUrl();
  const cookieSecret = authCookieSecret();

  if (!baseUrl) {
    throw new Error("NEON_AUTH_BASE_URL_NOT_CONFIGURED");
  }

  if (!cookieSecret) {
    throw new Error("NEON_AUTH_COOKIE_SECRET_NOT_CONFIGURED");
  }

  return createNeonAuth({
    baseUrl,
    cookies: { secret: cookieSecret },
    logLevel: "warn"
  });
}
