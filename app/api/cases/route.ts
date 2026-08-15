import { NextRequest, NextResponse } from "next/server";
import { authenticateOperator } from "@/lib/api-auth";
import { demoEvidence, demoProfile } from "@/lib/demo";
import { buildBrainSnapshot } from "@/lib/orchestrator";

export async function GET(request: NextRequest) {
  const auth = authenticateOperator(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const snapshot = buildBrainSnapshot(demoProfile, demoEvidence);
  return NextResponse.json({ mode: auth.mode, organizationId: auth.organizationId, cases: snapshot.cases, evidence: snapshot.evidence });
}
