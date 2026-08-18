import { paymentProviderSummary } from "./payment-providers";
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

function leadDeliveryConfigured() {
  const webhookReady = configured("LEADS_WEBHOOK_URL");
  const emailReady = configured("RESEND_API_KEY") && configured("LEADS_NOTIFICATION_EMAIL") && configured("LEADS_FROM_EMAIL");
  return { ready: webhookReady || emailReady, webhookReady, emailReady };
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
  const stateRoutingReady = stateRuntime.jurisdictions === 51 && stateRuntime.federalBaselineCoverage && stateRuntime.failClosed;
  const leadDelivery = leadDeliveryConfigured();
  const payments = paymentProviderSummary();
  const settlementProviders = payments.providers.filter((provider) => provider.configured && provider.mode === "processor");
  const paymentSettlementReady = settlementProviders.length > 0;

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
    { id: "lead-delivery", label: "Real lead delivery channel", status: leadDelivery.ready ? "ready" : "setup", requiredForProduction: true, detail: leadDelivery.ready ? `Approved lead delivery configured (${leadDelivery.webhookReady ? "webhook" : "email"})` : "Configure LEADS_WEBHOOK_URL or Resend lead notification variables before paid acquisition" },
    { id: "payment-settlement", label: "Verified payment settlement processor", status: paymentSettlementReady ? "ready" : "setup", requiredForProduction: true, detail: paymentSettlementReady ? `${settlementProviders.map((provider) => provider.name).join(", ")} processor settlement configured` : "Configure at least one hosted processor with signed webhook settlement before collecting production revenue" },
    { id: "bureau", label: "Authorized live credit data provider", status: liveProviderConfigured ? "ready" : "setup", requiredForProduction: false, detail: liveProviderConfigured ? "contracted provider name and API credential configured" : "deferred by business strategy until client volume and profitability justify contracted integration; free consumer imports remain the active operating model" },
    { id: "vault", label: "Private evidence document vault", status: privateBlobConfigured ? "ready" : "setup", requiredForProduction: true, detail: privateBlobConfigured ? "Vercel Private Blob credential configured" : "private Blob store/credential not configured" },
    { id: "state-rules", label: "State compliance routing + fail-closed coverage", status: stateRoutingReady ? "ready" : "setup", requiredForProduction: true, detail: stateRoutingReady ? `${stateRuntime.jurisdictions} jurisdictions routed; ${stateRuntime.validated} autonomous rule bundles validated; ${stateRuntime.manualReviewRequired} remain fail-closed/manual; automation coverage ${stateRuntime.automationPercent}%; nationwide autonomous=${stateRuntime.nationwideAutonomous}` : "state compliance routing, federal baseline, or fail-closed coverage is incomplete" },
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
