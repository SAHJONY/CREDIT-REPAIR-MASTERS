export interface ReadinessCheck {
  id: string;
  label: string;
  status: "ready" | "setup" | "blocked";
  requiredForProduction: boolean;
}

export const readinessChecks: ReadinessCheck[] = [
  { id: "ui", label: "Owner command center", status: "ready", requiredForProduction: true },
  { id: "brain", label: "AI decision engine", status: "ready", requiredForProduction: true },
  { id: "policy", label: "Compliance policy gateway", status: "ready", requiredForProduction: true },
  { id: "case-model", label: "Case/evidence state model", status: "ready", requiredForProduction: true },
  { id: "db", label: "Encrypted production database", status: "setup", requiredForProduction: true },
  { id: "auth", label: "Production authentication + RBAC", status: "setup", requiredForProduction: true },
  { id: "bureau", label: "Authorized credit data provider", status: "setup", requiredForProduction: true },
  { id: "vault", label: "Encrypted evidence document vault", status: "setup", requiredForProduction: true },
  { id: "state-rules", label: "State-by-state compliance rules", status: "setup", requiredForProduction: true },
  { id: "external-actions", label: "External action adapters", status: "blocked", requiredForProduction: false }
];

export function readinessSummary() {
  const required = readinessChecks.filter((item) => item.requiredForProduction);
  const ready = required.filter((item) => item.status === "ready").length;
  return {
    ready,
    required: required.length,
    percent: Math.round((ready / required.length) * 100),
    productionReady: ready === required.length
  };
}
