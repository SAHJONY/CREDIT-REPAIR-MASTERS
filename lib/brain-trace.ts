export interface BrainTraceEvent {
  id: string;
  type: "brain_started" | "tool_called" | "tool_result" | "model_completed" | "policy_checked" | "fallback" | "error";
  detail: string;
  at: string;
  durationMs?: number;
}

export interface BrainTrace {
  id: string;
  profileId: string;
  model: string;
  startedAt: string;
  completedAt?: string;
  events: BrainTraceEvent[];
  usage?: { inputTokens?: number; outputTokens?: number; totalTokens?: number };
}

export function createTrace(profileId: string, model: string): BrainTrace {
  return {
    id: `TRACE-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    profileId,
    model,
    startedAt: new Date().toISOString(),
    events: []
  };
}

export function traceEvent(trace: BrainTrace, type: BrainTraceEvent["type"], detail: string, durationMs?: number) {
  trace.events.push({
    id: `EV-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    detail: detail.slice(0, 500),
    at: new Date().toISOString(),
    durationMs
  });
}
