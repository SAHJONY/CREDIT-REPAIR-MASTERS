import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    version: "1.2.0",
    engine: "deterministic-evidence-first",
    issueTypes: ["accurate_negative", "wrong_balance", "wrong_payment_history", "duplicate_account", "identity_mismatch", "not_mine", "incorrect_dates", "incomplete_reporting", "other_inaccuracy"],
    rules: {
      accurateNegative: "blocked",
      noVerifiedEvidence: "blocked",
      identityIssueWithoutVerifiedIdentityEvidence: "blocked",
      verifiedInaccuracy: "draft_eligible_only",
      submission: "separate_policy_and_approval_required",
      externalExecution: false
    },
    aiTool: "evaluate_dispute_claim"
  });
}
