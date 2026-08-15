import type { AgentCard, CreditProfile } from "./types";
import type { EvidenceItem } from "./case-types";

export const demoProfile: CreditProfile = {
  id: "CRM-DEMO-001",
  name: "Demo Consumer",
  mode: "consumer",
  scores: [
    { bureau: "Experian", score: 612 },
    { bureau: "Equifax", score: 605 },
    { bureau: "TransUnion", score: 619 }
  ],
  accounts: [
    { id: "a1", creditor: "Card A", type: "revolving", balance: 4200, limit: 5000, status: "current", reportedBy: ["EX", "EQ", "TU"] },
    { id: "a2", creditor: "Card B", type: "revolving", balance: 1800, limit: 3000, status: "late", reportedBy: ["EX", "EQ", "TU"] },
    { id: "a3", creditor: "Collection C", type: "collection", balance: 940, status: "collection", reportedBy: ["EQ", "TU"] }
  ],
  hardInquiries: 5,
  ageMonths: 18,
  cashAvailable: 3000
};

export const agents: AgentCard[] = [
  { name: "Credit CEO", role: "Orchestration & next-best-action", state: "active", metric: "7 actions prioritized" },
  { name: "Report Parser", role: "Normalize bureau data", state: "active", metric: "3 bureaus mapped" },
  { name: "Evidence Agent", role: "Evidence linking & confidence", state: "review", metric: "2 cases need documents" },
  { name: "Dispute Agent", role: "Legitimate dispute preparation", state: "waiting", metric: "0 auto-submissions" },
  { name: "Utilization Agent", role: "Cash-efficient paydown modeling", state: "active", metric: "$2,250 allocatable" },
  { name: "Compliance Guard", role: "FCRA/CROA/state-policy gates", state: "active", metric: "0 blocked-policy bypasses" },
  { name: "Deadline Agent", role: "Investigation & response tracking", state: "active", metric: "No overdue cases" },
  { name: "Business Credit Agent", role: "Commercial credit readiness", state: "waiting", metric: "Profile not connected" }
];

export const demoEvidence: EvidenceItem[] = [
  {
    id: "EV-DEMO-001",
    caseId: "CASE-CRM-DEMO-001-002",
    kind: "credit_report",
    label: "Three-bureau report snapshot",
    source: "Demo import",
    capturedAt: "2026-08-15T10:00:00.000Z",
    verified: true
  },
  {
    id: "EV-DEMO-002",
    caseId: "CASE-CRM-DEMO-001-003",
    kind: "statement",
    label: "Collection account statement placeholder",
    source: "Demo evidence vault",
    capturedAt: "2026-08-15T10:01:00.000Z",
    verified: false
  }
];
