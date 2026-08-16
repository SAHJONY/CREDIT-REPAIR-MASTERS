import { stateComplianceRuntimeSummary } from "./state-compliance";

declare const process: { env: Record<string, string | undefined> };

export interface ReadinessCheck {
  id: string;
  label: string;
  status: "ready" | "setup" | "blocked";
  requiredForProduction: boolean;
  detail?: string;
}

function configured(name: string) {
  return Boolean(process.env[name]?.trim());
}

export function getReadinessChecks(): ReadinessCheck[] {
  const databaseConfigured = configured("DATABASE_URL");
  const authUrlConfigured = configured("NEON_AUTH_BASE_URL") || configured("VITE_NEON_AUTH_URL");
  const authCookieSecretConfigured = configured("NEON_AUTH_COOKIE_SECRET") || configured("AUTH_SECRET");
  const sessionAuthConfigured = authUrlConfigured && authCookieSecretConfigured;
  const mfaEnforced = process.env.AUTH_MFA_ENFORCED === "true";
  const liveProviderConfigured = configured("CREDIT_DATA_PROVIDER") && configured("CREDIT_PROVIDER_API_KEY");
  const privateBlobConfigured = configured("BLOB_READ_WRITE_TOKEN");
  const stateRuntime = stateComplianceRuntimeSummary();

  return [
    { id: "ui", label: "Owner command center", status: "ready", requiredForProduction: true },
    { id: "brain", label: "AI decision engine", status: "ready", requiredForProduction: true },
    { id: "policy", label: "Compliance policy gateway", status: "ready", requiredForProduction: true },
    { id: "case-model", label: "Case/evidence state model", status: "ready", requiredForProduction: true },
    { id: "storage-contract", label: "Production storage contract + SQL schema", status: "ready", requiredForProduction: true },
    { id: "rbac-model", label: "Role/permission model", status: "ready", requiredForProduction: true },
    { id: "ledger-model", label: "Consent/audit/agent-run ledger model", status: "ready", requiredForProduction: true },
    { id: "db", label: "Encrypted production database provisioned", status: databaseConfigured ? "ready" : "setup", requiredForProduction: true, detail: databaseConfigured ? "DATABASE_URL configured" : "DATABASE_URL missing" },
    { id: "auth-runtime", label: "Neon session authentication + membership gate", status: sessionAuthConfigured && databaseConfigured ? "ready" : "setup", requiredForProduction: true, detail: sessionAuthConfigured && databaseConfigured ? "Neon Auth runtime and tenant membership store configured" : "Neon Auth URL/cookie secret or production database missing" },
    { id: "mfa", label: "MFA enforcement for privileged operators", status: mfaEnforced ? "ready" : "setup", requiredForProduction: true, detail: mfaEnforced ? "MFA enforcement declared active" : "MFA enforcement not yet verified" },
    { id: "free-credit-sources", label: "Free consumer credit disclosure sources", status: "ready", requiredForProduction: true, detail: "consumer-controlled free-report intake is the active production operating model" },
    { id: "bureau", label: "Authorized live credit data provider", status: liveProviderConfigured ? "ready" : "setup", requiredForProduction: false, detail: liveProviderConfigured ? "contracted provider name and API credential configured" : "deferred by business strategy until client volume and profitability justify contracted integration; free consumer imports remain the active operating model" },
    { id: "vault", label: "Private evidence document vault", status: privateBlobConfigured ? "ready" : "setup", requiredForProduction: true, detail: privateBlobConfigured ? "Vercel Private Blob credential configured" : "private Blob store/credential not configured" },
    { id: "state-rules", label: "State compliance routing + fail-closed coverage", status: stateRuntime.runtimeReady ? "ready" : "setup", requiredForProduction: true, detail: stateRuntime.runtimeReady ? `${stateRuntime.jurisdictions} jurisdictions routed; ${stateRuntime.validated} state overlay validated; ${stateRuntime.manualReviewRequired} require manual compliance review; unsupported jurisdictions blocked` : "state compliance runtime incomplete" },
    { id: "external-actions", label: "External action adapters", status: "blocked", requiredForProduction: false, detail: "intentionally approval-gated" }
  ];
}

export const readinessChecks = getReadinessChecks();

export function readinessSummary(checks = getReadinessChecks()) {
  const required = checks.filter((item) => item.requiredForProduction);
  const ready = required.filter((item) => item.status === "ready").length;
  return {
    ready,
    required: required.length,
    percent: Math.round((ready / required.length) * 100),
    productionReady: ready === required.length
  };
}
