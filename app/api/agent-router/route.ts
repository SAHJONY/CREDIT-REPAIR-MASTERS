import { NextResponse } from "next/server";
import { routeAgentTask, type RoutingContext } from "@/lib/agent-router";
import { createWorkflowPlan } from "@/lib/workflow-engine";

export async function POST(request: Request) {
  const context = (await request.json()) as RoutingContext;
  try {
    return NextResponse.json({ route: routeAgentTask(context), workflow: createWorkflowPlan(context) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "ROUTING_ERROR" }, { status: 400 });
  }
}
