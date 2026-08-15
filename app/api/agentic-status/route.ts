import { NextResponse } from "next/server";
import { agentRegistrySummary } from "@/lib/agent-registry";
import { evalSummary } from "@/lib/agent-evals";
import { defaultModelBudget } from "@/lib/model-budget";

export async function GET() {
  return NextResponse.json({
    version: "0.6.0",
    controlPlane: "active",
    registry: agentRegistrySummary(),
    evals: evalSummary(),
    modelBudget: defaultModelBudget,
    durableWorkflowRuntime: "spec-ready",
    productionExternalExecution: false
  });
}
