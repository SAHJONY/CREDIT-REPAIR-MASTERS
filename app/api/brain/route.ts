import { NextRequest, NextResponse } from "next/server";
import { authenticateOperator } from "@/lib/api-auth";
import { demoEvidence, demoProfile } from "@/lib/demo";
import { buildBrainSnapshot } from "@/lib/orchestrator";
import { readinessSummary } from "@/lib/readiness";

export async function GET(request: NextRequest) {
  const auth = authenticateOperator(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  return NextResponse.json({
    mode: auth.mode,
    organizationId: auth.organizationId,
    snapshot: buildBrainSnapshot(demoProfile, demoEvidence),
    readiness: readinessSummary(),
    policy: {
      autonomous: ["read", "analyze", "rank", "draft-with-verified-evidence", "monitor"],
      approvalRequired: ["submit-dispute", "make-payment", "open-or-close-credit", "identity-theft-workflow"],
      blocked: ["fabricate-evidence", "false-identity-theft-claim", "guaranteed-score-increase", "bypass-consent"]
    }
  });
}
