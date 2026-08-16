import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { buildBrainSnapshot } from "@/lib/orchestrator";
import { runChatGPTBrain } from "@/lib/openai-brain";
import { clearMemory } from "@/lib/brain-memory";
import { authenticateBusinessUser, authorizeRoles } from "@/lib/api-auth";
import { getPlatformStore } from "@/lib/platform-store";
import type { EvidenceKind, EvidenceItem } from "@/lib/case-types";
import { completeOperation, failOperation, startOperation } from "@/lib/telemetry";

const accountSchema = z.object({
  id: z.string().trim().min(1).max(160),
  creditor: z.string().trim().min(1).max(200),
  type: z.enum(["revolving", "installment", "collection", "mortgage", "other"]),
  balance: z.number().finite().min(0),
  limit: z.number().finite().positive().optional(),
  status: z.enum(["current", "late", "collection", "closed"]),
  reportedBy: z.array(z.string().trim().min(1).max(80)).max(10),
  disputed: z.boolean().optional()
});

const snapshotSchema = z.object({
  scores: z.array(z.object({ bureau: z.string().trim().min(1).max(80), score: z.number().int().min(300).max(850).nullable() })).max(10),
  accounts: z.array(accountSchema).max(500),
  hardInquiries: z.number().int().min(0).max(500),
  ageMonths: z.number().int().min(0).max(2400),
  cashAvailable: z.number().finite().min(0).max(100000000)
});

const bodySchema = z.object({
  clientId: z.string().trim().min(3).max(160),
  message: z.string().trim().max(12000).optional(),
  clearMemory: z.boolean().optional(),
  snapshot: snapshotSchema.optional()
});

function mapEvidenceType(type: string): EvidenceKind {
  if (type === "identity_document") return "identity";
  if (type === "credit_report" || type === "statement" || type === "payment_record" || type === "correspondence" || type === "other") return type;
  return "other";
}

export async function POST(request: NextRequest) {
  const op = startOperation(request, "/api/chatgpt-brain", "chatgpt_brain.run");
  const auth = authorizeRoles(
    await authenticateBusinessUser(request),
    ["owner", "admin", "credit_specialist", "compliance_reviewer"]
  );
  if (!auth.ok) {
    failOperation(op, auth.error);
    return NextResponse.json({ error: auth.error, requestId: op.requestId }, { status: auth.status });
  }

  try {
    const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      failOperation(op, "INVALID_CREDIT_BRAIN_PAYLOAD");
      return NextResponse.json({ error: "INVALID_CREDIT_BRAIN_PAYLOAD", issues: parsed.error.flatten(), requestId: op.requestId }, { status: 400 });
    }

    const store = getPlatformStore();
    const client = await store.getClient(auth.organizationId, parsed.data.clientId);
    if (!client) {
      failOperation(op, "CLIENT_NOT_FOUND");
      return NextResponse.json({ error: "CLIENT_NOT_FOUND", requestId: op.requestId }, { status: 404 });
    }

    if (!parsed.data.snapshot) {
      failOperation(op, "CREDIT_SNAPSHOT_REQUIRED");
      return NextResponse.json({
        error: "CREDIT_SNAPSHOT_REQUIRED",
        requestId: op.requestId,
        clientId: client.id,
        note: "Provide a validated client credit snapshot or connect an authorized credit-data provider. Missing credit fields are never synthesized as zero or demo values."
      }, { status: 409 });
    }

    if (parsed.data.clearMemory) clearMemory(client.id);

    const storedEvidence = await store.listEvidence(auth.organizationId, client.id);
    const evidence: EvidenceItem[] = storedEvidence
      .filter((item) => Boolean(item.caseId))
      .map((item) => ({
        id: item.id,
        caseId: item.caseId as string,
        kind: mapEvidenceType(item.type),
        label: item.label,
        source: item.vaultRef ? "private_vault" : "metadata",
        capturedAt: item.createdAt,
        checksum: item.sha256,
        verified: item.verification === "verified"
      }));

    const profile = {
      id: client.id,
      name: client.displayName,
      mode: client.kind,
      scores: parsed.data.snapshot.scores,
      accounts: parsed.data.snapshot.accounts,
      hardInquiries: parsed.data.snapshot.hardInquiries,
      ageMonths: parsed.data.snapshot.ageMonths,
      cashAvailable: parsed.data.snapshot.cashAvailable
    } as const;

    const snapshot = buildBrainSnapshot(profile, evidence);
    const result = await runChatGPTBrain(snapshot, parsed.data.message);

    completeOperation(op, {
      authMode: auth.mode,
      role: auth.role,
      engine: "openai",
      clientId: client.id,
      snapshotSource: "validated-request",
      externalSideEffects: false
    });

    return NextResponse.json({
      requestId: op.requestId,
      engine: "ChatGPT / OpenAI Responses API",
      architecture: "tool-using-credit-ceo",
      execution: "advisory-only",
      requestedBy: auth.actorId,
      organizationId: auth.organizationId,
      clientId: client.id,
      snapshotSource: "validated-request",
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
  return NextResponse.json({
    version: "2.1.0",
    engine: "ChatGPT / OpenAI Responses API",
    configured: Boolean(env.OPENAI_API_KEY),
    model: env.OPENAI_MODEL || "gpt-5.6",
    store: false,
    toolCalling: true,
    liveDataContract: {
      clientBound: true,
      validatedSnapshotRequired: true,
      authorizedProviderConfigured: Boolean(env.CREDIT_DATA_PROVIDER),
      demoFallback: false
    },
    authorityBoundary: {
      chatgpt: "reason, prioritize, inspect internal state, propose",
      policyEngine: "allow, require approval, or block",
      executor: "not exposed to the model"
    }
  });
}
