export interface MemoryTurn {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  at: string;
}

export interface CaseMemory {
  profileId: string;
  turns: MemoryTurn[];
  updatedAt: string;
}

const memory = new Map<string, CaseMemory>();
const MAX_TURNS = 12;

function id() {
  return `MEM-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function remember(profileId: string, role: MemoryTurn["role"], text: string): CaseMemory {
  const existing = memory.get(profileId) ?? { profileId, turns: [], updatedAt: new Date().toISOString() };
  const sanitized = text.replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[REDACTED_SSN]").slice(0, 4000);
  const next = {
    profileId,
    turns: [...existing.turns, { id: id(), role, text: sanitized, at: new Date().toISOString() }].slice(-MAX_TURNS),
    updatedAt: new Date().toISOString()
  };
  memory.set(profileId, next);
  return next;
}

export function getMemory(profileId: string): CaseMemory {
  return memory.get(profileId) ?? { profileId, turns: [], updatedAt: new Date().toISOString() };
}

export function clearMemory(profileId: string) {
  memory.delete(profileId);
}
