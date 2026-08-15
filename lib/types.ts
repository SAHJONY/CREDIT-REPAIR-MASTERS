export type RiskLevel = "low" | "medium" | "high" | "blocked";
export type AgentState = "active" | "review" | "waiting" | "blocked";

export interface CreditAccount {
  id: string;
  creditor: string;
  type: "revolving" | "installment" | "collection" | "mortgage" | "other";
  balance: number;
  limit?: number;
  status: "current" | "late" | "collection" | "closed";
  reportedBy: string[];
  disputed?: boolean;
}

export interface CreditProfile {
  id: string;
  name: string;
  mode: "consumer" | "business";
  scores: { bureau: string; score: number | null }[];
  accounts: CreditAccount[];
  hardInquiries: number;
  ageMonths: number;
  cashAvailable: number;
}

export interface Finding {
  id: string;
  title: string;
  reason: string;
  severity: RiskLevel;
  confidence: number;
  action: string;
  requiresApproval: boolean;
}

export interface AgentCard {
  name: string;
  role: string;
  state: AgentState;
  metric: string;
}
