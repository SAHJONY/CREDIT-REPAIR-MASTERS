import { NextRequest, NextResponse } from "next/server";
import { demoEvidence, demoProfile } from "@/lib/demo";
import { buildBrainSnapshot } from "@/lib/orchestrator";
import { runChatGPTBrain } from "@/lib/openai-brain";
import { clearMemory, getMemory } from "@/lib/brain-memory";
import { authenticateOperator } from "@/lib/api-auth";
import { completeOperation, failOperation, startOperation } from "@/lib/telemetry";

export async function POST(request: NextRequest) {
  const op = startOperation(request, "/api/chatgpt-brain", "chatgpt_brain.run");
  const auth = authenticateOperator(request);
  if (!auth.ok) {
    failOperation(op, auth.error);
    return NextResponse.json({ error: auth.error, requestId: op.requestId }, { status: auth.status });
  }
  try {
    const body = await request.json().catch(() => ({})) as { message?: string; clearMemory?: boolean };
    if (body.clearMemory) clearMemory(demoProfile.id);
    const snapshot = buildBrainSnapshot(demoProfile, demoEvidence);
    const result = await runChatGPTBrain(snapshot, body.message);
    completeOperation(op, { authMode: auth.mode, engine: "openai", externalSideEffects: false });
    return NextResponse.json({
      requestId: op.requestId,
      engine: "ChatGPT / OpenAI Responses API",
      architecture: "tool-using-credit-ceo",
      execution: "advisory-only",
      requestedBy: auth.actorId,
      complianceAuthority: "local-policy-engine",
      externalSideEffects: false,
      result
    });
  } catch (error) {
    failOperation(op, "CHATGPT_BRAIN_FAILED", error);
    return NextResponse.json({ error: "CHATGPT_BRAIN_FAILED", requestId: op.requestId }, { status: 500 });
  }
}

export async function GET() {
  const env = (globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
  const configured = Boolean(env.OPENAI_API_KEY);
  return NextResponse.json({
    version: "1.2.0",
    engine: "ChatGPT / OpenAI Responses API",
    configured,
    operatorAuthConfigured: Boolean(env.CREDIT_OS_API_TOKEN),
    model: env.OPENAI_MODEL || "gpt-5.6",
    store: false,
    toolCalling: true,
    tools: ["inspect_snapshot", "inspect_case", "calculate_paydown", "evaluate_policy", "evaluate_dispute_claim"],
    memory: { mode: "ephemeral-server", turns: getMemory(demoProfile.id).turns.length, piiMinimized: true },
    authorityBoundary: {
      chatgpt: "reason, prioritize, inspect internal state, propose",
      policyEngine: "allow, require approval, or block",
      executor: "not exposed to the model"
    }
  });
}
