import { NextResponse } from "next/server";
import { routeAgentTask, type RoutingContext } from "@/lib/agent-router";
import { createWorkflowPlan } from "@/lib/workflow-engine";
import { authenticateOperator } from "@/lib/api-auth";
import { completeOperation, failOperation, startOperation } from "@/lib/telemetry";

export async function POST(request: Request) {
  const op = startOperation(request, "/api/agent-router", "agent_router.route");
  const auth = authenticateOperator(request);
  if (!auth.ok) {
    failOperation(op, auth.error);
    return NextResponse.json({ error: auth.error, requestId: op.requestId }, { status: auth.status });
  }
  try {
    const context = (await request.json()) as RoutingContext;
    const route = routeAgentTask(context);
    const workflow = createWorkflowPlan(context);
    completeOperation(op, { authMode: auth.mode, intent: context.intent, execution: route.execution });
    return NextResponse.json({ requestId: op.requestId, route, workflow });
  } catch (error) {
    failOperation(op, "ROUTING_ERROR", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "ROUTING_ERROR", requestId: op.requestId }, { status: 400 });
  }
}
