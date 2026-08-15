import { createNeonAuth } from "@neondatabase/auth/next/server";

function required(name: "NEON_AUTH_BASE_URL" | "NEON_AUTH_COOKIE_SECRET") {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name}_NOT_CONFIGURED`);
  return value;
}

export function neonAuthConfigured() {
  return Boolean(process.env.NEON_AUTH_BASE_URL?.trim() && process.env.NEON_AUTH_COOKIE_SECRET?.trim());
}

export function getNeonAuth() {
  return createNeonAuth({
    baseUrl: required("NEON_AUTH_BASE_URL"),
    cookies: { secret: required("NEON_AUTH_COOKIE_SECRET") },
    logLevel: "warn"
  });
}
