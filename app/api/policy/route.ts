import { NextRequest, NextResponse } from "next/server";
import { policyDecision } from "@/lib/orchestrator";
import type { ProposedAction } from "@/lib/compliance";

export async function POST(request: NextRequest) {
  const body = await request.json() as { profileId?: string; caseId?: string; action?: ProposedAction };
  if (!body.profileId || !body.action?.kind) {
    return NextResponse.json({ error: "profileId and action are required" }, { status: 400 });
  }
  const event = policyDecision(body.profileId, body.action, "API Policy Gateway", body.caseId);
  return NextResponse.json({ event }, { status: event.decision === "blocked" ? 403 : 200 });
}
