import { NextResponse } from "next/server";
import { demoEvidence, demoProfile } from "@/lib/demo";
import { buildBrainSnapshot } from "@/lib/orchestrator";
import { readinessSummary } from "@/lib/readiness";

export async function GET() {
  return NextResponse.json({
    mode: "demo-safe",
    snapshot: buildBrainSnapshot(demoProfile, demoEvidence),
    readiness: readinessSummary(),
    policy: {
      autonomous: ["read", "analyze", "rank", "draft-with-evidence", "monitor"],
      approvalRequired: ["submit-dispute", "make-payment", "open-or-close-credit", "identity-theft-workflow"],
      blocked: ["fabricate-evidence", "false-identity-theft-claim", "guaranteed-score-increase", "bypass-consent"]
    }
  });
}
