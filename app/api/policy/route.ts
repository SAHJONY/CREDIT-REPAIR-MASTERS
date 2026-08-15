import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { policyDecision } from "@/lib/orchestrator";
import { evaluateResolvedAction, type ProposedAction } from "@/lib/compliance";
import { authenticateOperator } from "@/lib/api-auth";
import { getPlatformStore } from "@/lib/platform-store";
import { completeOperation, failOperation, startOperation } from "@/lib/telemetry";

function requiresCase(action: ProposedAction): boolean {
  return action.kind === "draft_dispute" || action.kind === "submit_dispute" || action.kind === "identity_theft_claim";
}

function actionConsentId(action: ProposedAction): string | undefined {
  return "consentId" in action ? action.consentId : undefined;
}

export async function POST(request: NextRequest) {
  const op = startOperation(request, "/api/policy", "policy.evaluate");
  const auth = authenticateOperator(request);
  if (!auth.ok) {
    failOperation(op, auth.error);
    return NextResponse.json({ error: auth.error, requestId: op.requestId }, { status: auth.status });
  }

  const body = await request.json() as { profileId?: string; caseId?: string; action?: ProposedAction };
  if (!body.profileId || !body.action?.kind) {
    failOperation(op, "POLICY_INPUT_INVALID");
    return NextResponse.json({ error: "profileId and action are required", requestId: op.requestId }, { status: 400 });
  }
  if (requiresCase(body.action) && !body.caseId) {
    failOperation(op, "CASE_ID_REQUIRED");
    return NextResponse.json({ error: "caseId is required for dispute and identity workflows", requestId: op.requestId }, { status: 400 });
  }

  try {
    const store = getPlatformStore();
    const client = await store.getClient(auth.organizationId, body.profileId);
    if (!client) {
      failOperation(op, "CLIENT_NOT_FOUND_IN_TENANT");
      return NextResponse.json({ error: "CLIENT_NOT_FOUND_IN_TENANT", requestId: op.requestId }, { status: 404 });
    }

    const [allEvidence, consents] = await Promise.all([
      store.listEvidence(auth.organizationId, client.id),
      store.listConsents(auth.organizationId, client.id)
    ]);
    const evidence = body.caseId ? allEvidence.filter((item) => item.caseId === body.caseId) : allEvidence;
    const consentId = actionConsentId(body.action);
    const consent = consentId ? consents.find((item) => item.id === consentId) : undefined;
    const resolved = evaluateResolvedAction(body.action, { evidence, consent });
    const event = policyDecision(body.profileId, body.action, auth.actorId, body.caseId, resolved);

    await store.appendAudit(auth.organizationId, {
      id: randomUUID(),
      organizationId: auth.organizationId,
      actorType: "user",
      actorId: auth.actorId,
      action: body.action.kind,
      resourceType: body.caseId ? "credit_case" : "client",
      resourceId: body.caseId || client.id,
      decision: event.decision === "recorded" ? undefined : event.decision,
      metadata: {
        requestId: op.requestId,
        clientId: client.id,
        verifiedEvidenceCount: evidence.filter((item) => item.verification === "verified").length,
        consentResolved: Boolean(consent)
      },
      createdAt: event.at
    });

    completeOperation(op, { authMode: auth.mode, action: body.action.kind, decision: event.decision });
    return NextResponse.json({ requestId: op.requestId, event }, { status: event.decision === "blocked" ? 403 : 200 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "POLICY_EVALUATION_FAILED";
    failOperation(op, code);
    return NextResponse.json({ error: code, requestId: op.requestId }, { status: 503 });
  }
}
