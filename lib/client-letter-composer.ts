export type ClientLetterTone = "straightforward" | "warm" | "formal" | "concise";

export interface ClientDisputeLetterInput {
  clientName: string;
  clientAddress?: string;
  recipientName: string;
  recipientAddress?: string;
  accountOrReference?: string;
  disputedField: string;
  currentReporting: string;
  clientPosition: string;
  factualBasis: string;
  supportingDocuments: string[];
  requestedResolution: string;
  relevantDates?: string[];
  priorContact?: string;
  tone?: ClientLetterTone;
}

export interface ClientDisputeLetterDraft {
  subject: string;
  body: string;
  requiresClientReview: true;
  requiresApproval: true;
  externalExecutionEnabled: false;
  draftingStandard: "client-voice-factual-v1";
  warnings: string[];
}

const forbiddenPatterns = [
  /as an ai/i,
  /language model/i,
  /guarantee(?:d)? deletion/i,
  /guarantee(?:d)? score/i,
  /i hereby demand immediate deletion of all negative/i,
  /remove all negative information/i
];

function clean(value: string | undefined, max = 1800) {
  return (value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

function validateInput(input: ClientDisputeLetterInput) {
  const required = [input.clientName, input.recipientName, input.disputedField, input.currentReporting, input.clientPosition, input.factualBasis, input.requestedResolution];
  if (required.some((value) => !clean(value))) throw new Error("LETTER_FACTS_INCOMPLETE");
  if (!input.supportingDocuments.length) throw new Error("LETTER_SUPPORTING_DOCUMENTS_REQUIRED");
}

function promptFor(input: ClientDisputeLetterInput) {
  const facts = {
    clientName: clean(input.clientName, 160),
    clientAddress: clean(input.clientAddress, 240),
    recipientName: clean(input.recipientName, 160),
    recipientAddress: clean(input.recipientAddress, 240),
    accountOrReference: clean(input.accountOrReference, 120),
    disputedField: clean(input.disputedField, 320),
    currentReporting: clean(input.currentReporting, 600),
    clientPosition: clean(input.clientPosition, 600),
    factualBasis: clean(input.factualBasis, 1800),
    supportingDocuments: input.supportingDocuments.slice(0, 12).map((item) => clean(item, 220)),
    requestedResolution: clean(input.requestedResolution, 600),
    relevantDates: (input.relevantDates ?? []).slice(0, 12).map((item) => clean(item, 120)),
    priorContact: clean(input.priorContact, 700),
    tone: input.tone ?? "straightforward"
  };

  return `Prepare a draft consumer dispute letter for the client's own review and approval.

WRITING STANDARD
- Write like a real individual explaining a problem in their own words: clear, calm, specific, and natural.
- Use first person ("I") because this is a client-facing draft, but never imply the client already wrote, signed, mailed, or personally authored the draft.
- Ground every factual statement only in the supplied facts. Never invent dates, calls, payments, balances, identity-theft facts, bureau responses, legal conclusions, or supporting evidence.
- Explain the problem in a short narrative: what the client saw, why the client believes it is wrong or incomplete, what evidence supports that belief, and what specific result the client is requesting.
- Prefer ordinary language over legalistic boilerplate. Do not stack statutes, threaten litigation, or use canned phrases unless a supplied fact specifically requires them.
- Avoid generic mass-dispute wording such as "I hereby demand," "delete all negative items," "cease and desist," or repetitive formulaic paragraphs.
- Sentence lengths may vary naturally. Keep paragraphs short. Do not add fake typos, fake handwriting cues, fake personal history, or any technique intended to bypass AI-detection systems.
- Do not promise deletion, score improvement, funding, or any outcome.
- Mention attachments by their actual supplied names when useful.
- End with a simple request for the recipient to investigate the identified information and send the client the result.
- Return only the letter text, with a useful subject line followed by the body.

VERIFIED / CLIENT-CONFIRMED INPUT
${JSON.stringify(facts, null, 2)}`;
}

async function callOpenAI(prompt: string) {
  const env = (globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
  const apiKey = env.OPENAI_API_KEY;
  const model = env.OPENAI_MODEL || "gpt-5.6";
  if (!apiKey) throw new Error("OPENAI_API_KEY_NOT_CONFIGURED");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      store: false,
      instructions: "You draft factual client correspondence. Follow the supplied writing standard exactly. Do not fabricate facts and do not execute or submit anything externally.",
      input: prompt
    })
  });
  if (!response.ok) throw new Error(`LETTER_MODEL_FAILED_${response.status}`);
  const data = await response.json() as { output_text?: string; output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };
  return data.output_text || data.output?.flatMap((item) => item.content ?? []).find((item) => item.type === "output_text")?.text || "";
}

function splitSubject(text: string) {
  const normalized = text.trim();
  const lines = normalized.split(/\r?\n/);
  const first = lines[0]?.trim() ?? "";
  if (/^subject\s*:/i.test(first)) {
    return { subject: first.replace(/^subject\s*:\s*/i, "").trim(), body: lines.slice(1).join("\n").trim() };
  }
  return { subject: "Request to review disputed credit-report information", body: normalized };
}

export async function composeClientDisputeLetter(input: ClientDisputeLetterInput): Promise<ClientDisputeLetterDraft> {
  validateInput(input);
  const raw = await callOpenAI(promptFor(input));
  if (!raw.trim()) throw new Error("LETTER_MODEL_RETURNED_EMPTY_DRAFT");
  if (forbiddenPatterns.some((pattern) => pattern.test(raw))) throw new Error("LETTER_DRAFT_FAILED_QUALITY_GATE");
  const { subject, body } = splitSubject(raw);
  if (body.length < 180) throw new Error("LETTER_DRAFT_TOO_SHORT");

  return {
    subject: subject.slice(0, 180),
    body,
    requiresClientReview: true,
    requiresApproval: true,
    externalExecutionEnabled: false,
    draftingStandard: "client-voice-factual-v1",
    warnings: [
      "Draft must be reviewed by the client for factual accuracy before any approval or external transmission.",
      "If the facts or evidence change, regenerate or edit the draft before approval."
    ]
  };
}
