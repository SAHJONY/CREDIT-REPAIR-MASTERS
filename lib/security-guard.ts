export interface SecurityFinding {
  kind: "prompt_injection" | "ssn" | "email" | "phone" | "account_number";
  severity: "low" | "medium" | "high" | "critical";
  detail: string;
}

const injectionPatterns = [
  /ignore (all|any|the) (previous|prior) instructions/i,
  /reveal (the )?(system|developer) prompt/i,
  /bypass (the )?(policy|guardrail|approval|compliance)/i,
  /disable (the )?(policy|guardrail|approval|compliance)/i,
  /pretend (the )?(evidence|consent|authorization) exists/i
];

export function inspectTextSecurity(text: string): SecurityFinding[] {
  const findings: SecurityFinding[] = [];
  if (injectionPatterns.some((pattern) => pattern.test(text))) findings.push({ kind: "prompt_injection", severity: "critical", detail: "Instruction attempts to override application authority or policy boundaries." });
  if (/\b\d{3}-\d{2}-\d{4}\b/.test(text)) findings.push({ kind: "ssn", severity: "critical", detail: "Potential SSN detected." });
  if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(text)) findings.push({ kind: "email", severity: "medium", detail: "Email address detected." });
  if (/(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text)) findings.push({ kind: "phone", severity: "medium", detail: "Potential phone number detected." });
  if (/\b\d{10,19}\b/.test(text)) findings.push({ kind: "account_number", severity: "high", detail: "Long numeric identifier detected." });
  return findings;
}

export function minimizePII(text: string): string {
  return text
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[REDACTED_SSN]")
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[REDACTED_EMAIL]")
    .replace(/(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, "[REDACTED_PHONE]")
    .replace(/\b\d{10,19}\b/g, "[REDACTED_IDENTIFIER]");
}

export function secureModelInput(text: string) {
  const findings = inspectTextSecurity(text);
  return {
    allowed: !findings.some((finding) => finding.kind === "prompt_injection" && finding.severity === "critical"),
    findings,
    minimized: minimizePII(text)
  };
}
