export interface ModelBudgetPolicy {
  maxModelRounds: number;
  maxToolCalls: number;
  maxPromptChars: number;
  maxCompletionTokens: number;
}

export const defaultModelBudget: ModelBudgetPolicy = {
  maxModelRounds: 6,
  maxToolCalls: 16,
  maxPromptChars: 24000,
  maxCompletionTokens: 4000
};

export function enforceModelBudget(input: { rounds: number; toolCalls: number; promptChars: number; requestedCompletionTokens?: number }, policy = defaultModelBudget) {
  const violations: string[] = [];
  if (input.rounds > policy.maxModelRounds) violations.push("MODEL_ROUND_LIMIT");
  if (input.toolCalls > policy.maxToolCalls) violations.push("TOOL_CALL_LIMIT");
  if (input.promptChars > policy.maxPromptChars) violations.push("PROMPT_SIZE_LIMIT");
  if ((input.requestedCompletionTokens ?? 0) > policy.maxCompletionTokens) violations.push("COMPLETION_TOKEN_LIMIT");
  return { allowed: violations.length === 0, violations, policy };
}
