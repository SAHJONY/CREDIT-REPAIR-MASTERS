import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "available-per-brain-run",
    note: "Trace data is returned with each /api/chatgpt-brain result. Persistent encrypted trace storage is intentionally deferred until the production database is configured.",
    captures: ["model rounds", "tool calls", "tool results", "policy checks", "fallbacks", "token usage when reported"],
    secretsCaptured: false
  });
}
