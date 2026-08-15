import { NextResponse } from "next/server";
import { getRun } from "workflow/api";

export async function GET(request: Request) {
  const runId = new URL(request.url).searchParams.get("runId");
  if (!runId) return NextResponse.json({ error: "runId is required" }, { status: 400 });
  try {
    const run = getRun(runId);
    const status = await run.status;
    if (status === "completed") return NextResponse.json({ runId, status, result: await run.returnValue });
    return NextResponse.json({ runId, status });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "WORKFLOW_LOOKUP_FAILED" }, { status: 404 });
  }
}
