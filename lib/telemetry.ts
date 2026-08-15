import { randomUUID } from "node:crypto";

export interface OperationContext {
  requestId: string;
  route: string;
  operation: string;
  startedAt: number;
}

function emit(level: "info" | "error", payload: Record<string, string | number | boolean | null | undefined>) {
  const entry = JSON.stringify({ level, service: "credit-repair-masters", ...payload });
  if (level === "error") console.error(entry); else console.log(entry);
}

export function startOperation(request: Request, route: string, operation: string): OperationContext {
  const requestId = request.headers.get("x-vercel-id") || request.headers.get("x-request-id") || randomUUID();
  const context = { requestId, route, operation, startedAt: Date.now() };
  emit("info", { event: "operation.start", requestId, route, operation });
  return context;
}

export function completeOperation(context: OperationContext, metadata: Record<string, string | number | boolean | null | undefined> = {}) {
  emit("info", {
    event: "operation.complete",
    requestId: context.requestId,
    route: context.route,
    operation: context.operation,
    durationMs: Date.now() - context.startedAt,
    ...metadata
  });
}

export function failOperation(context: OperationContext, code: string, error?: unknown) {
  emit("error", {
    event: "operation.failed",
    requestId: context.requestId,
    route: context.route,
    operation: context.operation,
    durationMs: Date.now() - context.startedAt,
    code,
    errorType: error instanceof Error ? error.name : "unknown"
  });
}
