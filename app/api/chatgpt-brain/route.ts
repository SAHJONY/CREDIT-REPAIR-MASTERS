import { NextRequest, NextResponse } from "next/server";
import { demoEvidence, demoProfile } from "@/lib/demo";
import { buildBrainSnapshot } from "@/lib/orchestrator";
import { runChatGPTBrain } from "@/lib/openai-brain";
import { clearMemory, getMemory } from "@/lib/brain-memory";
import { authenticateOperator } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  const auth = authenticateOperator(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const body = await request.json().catch(() => ({})) as { message?: string; clearMemory?: boolean };
  if (body.clearMemory) clearMemory(demoProfile.id);
  const snapshot = buildBrainSnapshot(demoProfile, demoEvidence);
  const result = await runChatGPTBrain(snapshot, body.message);
  return NextResponse.json({
    engine: "ChatGPT / OpenAI Responses API",
    architecture: "tool-using-credit-ceo",
    execution: "advisory-only",
    requestedBy: auth.actorId,
    complianceAuthority: "local-policy-engine",
    externalSideEffects: false,
    result
  });
}

export async function GET() {
  const env = (globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
  const configured = Boolean(env.OPENAI_API_KEY);
  return NextResponse.json({
    engine: "ChatGPT / OpenAI Responses API",
    configured,
    operatorAuthConfigured: Boolean(env.CREDIT_OS_API_TOKEN),
    model: env.OPENAI_MODEL || "gpt-5.6",
    store: false,
    toolCalling: true,
    tools: ["inspect_snapshot", "inspect_case", "calculate_paydown", "evaluate_policy"],
    memory: { mode: "ephemeral-server", turns: getMemory(demoProfile.id).turns.length, piiMinimized: true },
    authorityBoundary: {
      chatgpt: "reason, prioritize, inspect internal state, propose",
      policyEngine: "allow, require approval, or block",
      executor: "not exposed to the model"
    }
  });
}
