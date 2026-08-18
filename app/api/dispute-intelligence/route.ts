import { NextRequest, NextResponse } from "next/server";
import { authenticateBusinessUser, authorizeRoles } from "@/lib/api-auth";
import { composeClientDisputeLetter, type ClientDisputeLetterInput } from "@/lib/client-letter-composer";

export async function GET() {
  return NextResponse.json({
    version: "1.3.0",
    engine: "deterministic-evidence-first",
    issueTypes: ["accurate_negative", "wrong_balance", "wrong_payment_history", "duplicate_account", "identity_mismatch", "not_mine", "incorrect_dates", "incomplete_reporting", "other_inaccuracy"],
    rules: {
      accurateNegative: "blocked",
      noVerifiedEvidence: "blocked",
      identityIssueWithoutVerifiedIdentityEvidence: "blocked",
      verifiedInaccuracy: "draft_eligible_only",
      draftingStandard: "client-voice-factual-v1",
      clientReview: "required",
      submission: "separate_policy_and_approval_required",
      externalExecution: false
    },
    drafting: {
      style: "natural_first_person_fact_specific",
      boilerplateMinimized: true,
      fabricatedFacts: "blocked",
      aiDetectionEvasion: "not_supported",
      fakeTyposOrAuthorshipSignals: "not_supported"
    },
    aiTool: "evaluate_dispute_claim"
  });
}

export async function POST(request: NextRequest) {
  const auth = authorizeRoles(
    await authenticateBusinessUser(request),
    ["owner", "admin", "credit_specialist", "compliance_reviewer"]
  );
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  let input: ClientDisputeLetterInput;
  try {
    input = await request.json() as ClientDisputeLetterInput;
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  try {
    const draft = await composeClientDisputeLetter(input);
    return NextResponse.json({
      organizationId: auth.organizationId,
      draft,
      status: "draft_requires_client_review",
      submitted: false
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "LETTER_DRAFT_FAILED";
    const status = code.includes("INCOMPLETE") || code.includes("REQUIRED") ? 400 : code === "OPENAI_API_KEY_NOT_CONFIGURED" ? 503 : 422;
    return NextResponse.json({ error: code }, { status });
  }
}
