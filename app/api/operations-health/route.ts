import { NextResponse } from "next/server";
import { evalSummary } from "@/lib/agent-evals";
import { agentRegistrySummary } from "@/lib/agent-registry";

export async function GET() {
  const evals = evalSummary();
  return NextResponse.json({
    version: "1.1.0",
    observability: {
      structuredLogs: true,
      piiPayloadLogging: false,
      requestCorrelation: true,
      durationMetrics: true,
      runtimeRegistration: true
    },
    governance: {
      agentRegistry: agentRegistrySummary(),
      safetyEvalsPassing: evals.allPassed,
      safetyEvalPercent: evals.percent,
      externalExecutionEnabled: false
    }
  });
}
