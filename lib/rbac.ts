import type { Role } from "./platform-types";

export type Permission =
  | "org:read"
  | "org:manage"
  | "client:read"
  | "client:manage"
  | "case:read"
  | "case:manage"
  | "evidence:read"
  | "evidence:manage"
  | "consent:read"
  | "consent:manage"
  | "policy:review"
  | "audit:read"
  | "agent:run";

const grants: Record<Role, Permission[]> = {
  owner: ["org:read", "org:manage", "client:read", "client:manage", "case:read", "case:manage", "evidence:read", "evidence:manage", "consent:read", "consent:manage", "policy:review", "audit:read", "agent:run"],
  admin: ["org:read", "client:read", "client:manage", "case:read", "case:manage", "evidence:read", "evidence:manage", "consent:read", "consent:manage", "audit:read", "agent:run"],
  credit_specialist: ["client:read", "case:read", "case:manage", "evidence:read", "evidence:manage", "consent:read", "agent:run"],
  compliance_reviewer: ["client:read", "case:read", "evidence:read", "consent:read", "policy:review", "audit:read"],
  client: ["client:read", "case:read", "evidence:read", "consent:read", "consent:manage"],
  auditor: ["org:read", "client:read", "case:read", "evidence:read", "consent:read", "audit:read"]
};

export function can(role: Role, permission: Permission): boolean {
  return grants[role].includes(permission);
}

export function assertPermission(role: Role, permission: Permission): void {
  if (!can(role, permission)) throw new Error(`RBAC_DENIED:${role}:${permission}`);
}
