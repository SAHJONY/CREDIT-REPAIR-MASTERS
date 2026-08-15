import type { BrainSnapshot } from "./orchestrator";

export interface CouncilVote {
  role: "strategy" | "evidence" | "risk";
  verdict: "support" | "challenge" | "insufficient_evidence";
  note: string;
}

export interface CouncilResult {
  enabled: boolean;
  votes: CouncilVote[];
  consensus: "support" | "challenge" | "insufficient_evidence" | "not_run";
}

export function deterministicCouncil(snapshot: BrainSnapshot): CouncilResult {
  const evidenceCoverage = snapshot.metrics.evidenceCoverage;
  const hasHighRisk = snapshot.findings.some((f) => f.severity === "high");
  const votes: CouncilVote[] = [
    {
      role: "strategy",
      verdict: snapshot.attention.length ? "support" : "challenge",
      note: snapshot.attention.length ? "Prioritized next-best-actions exist." : "No prioritized action found."
    },
    {
      role: "evidence",
      verdict: evidenceCoverage >= 50 ? "support" : "insufficient_evidence",
      note: `Evidence coverage is ${evidenceCoverage}%.`
    },
    {
      role: "risk",
      verdict: hasHighRisk ? "challenge" : "support",
      note: hasHighRisk ? "High-severity items require conservative handling and policy checks." : "No high-severity finding detected."
    }
  ];
  const consensus = votes.some((v) => v.verdict === "insufficient_evidence")
    ? "insufficient_evidence"
    : votes.some((v) => v.verdict === "challenge")
      ? "challenge"
      : "support";
  return { enabled: true, votes, consensus };
}
