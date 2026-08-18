export type Role = "owner" | "admin" | "credit_specialist" | "compliance_reviewer" | "client" | "auditor";

export interface Organization {
  id: string;
  name: string;
  mode: "demo" | "production";
  createdAt: string;
}

export interface AppUser {
  id: string;
  organizationId: string;
  email: string;
  role: Role;
  status: "active" | "suspended";
  createdAt: string;
}

export interface ClientProfile {
  id: string;
  organizationId: string;
  displayName: string;
  kind: "consumer" | "business";
  state: string;
  status: "onboarding" | "active" | "paused" | "closed";
  createdAt: string;
  updatedAt: string;
}

export type LoanReadinessGoal = "mortgage" | "auto" | "credit_card" | "personal_loan" | "business_credit" | "lease" | "financed_purchase";

export interface LoanReadinessAction {
  priority: "P0" | "P1" | "P2";
  title: string;
  detail: string;
  targetDay?: number;
}

export interface LoanReadinessAssessment {
  id: string;
  organizationId: string;
  clientId: string;
  goal: LoanReadinessGoal;
  readinessScore: number;
  status: "READY TO SHOP" | "NEAR READY" | "BUILDING" | "NOT READY YET";
  creditScore: number;
  utilization: number;
  monthlyIncome: number;
  monthlyDebt: number;
  dti: number;
  onTimePaymentRate: number;
  derogatories: number;
  hardInquiries: number;
  cashReserves: number;
  reserveMonths: number;
  roadmap: LoanReadinessAction[];
  createdBy: string;
  createdAt: string;
}

export type ConsentScope =
  | "credit_report_analysis"
  | "dispute_drafting"
  | "dispute_submission"
  | "financial_action"
  | "new_credit"
  | "identity_theft_workflow";

export interface ConsentRecord {
  id: string;
  organizationId: string;
  clientId: string;
  scope: ConsentScope;
  granted: boolean;
  source: "client_portal" | "staff_recorded" | "api";
  grantedAt: string;
  expiresAt?: string;
  revokedAt?: string;
}

export interface EvidenceRecord {
  id: string;
  organizationId: string;
  clientId: string;
  caseId?: string;
  type: "credit_report" | "statement" | "payment_record" | "identity_document" | "correspondence" | "other";
  label: string;
  sha256?: string;
  vaultRef?: string;
  verification: "unverified" | "verified" | "rejected";
  createdAt: string;
}

export interface AuditRecord {
  id: string;
  organizationId: string;
  actorType: "user" | "agent" | "system";
  actorId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  decision?: "allowed" | "approval_required" | "blocked";
  metadata?: Record<string, string | number | boolean | null>;
  createdAt: string;
}

export interface AgentRunRecord {
  id: string;
  organizationId: string;
  clientId?: string;
  agent: string;
  model?: string;
  status: "started" | "completed" | "failed" | "fallback";
  inputFingerprint?: string;
  outputFingerprint?: string;
  toolCalls: number;
  promptTokens?: number;
  completionTokens?: number;
  createdAt: string;
  completedAt?: string;
}
