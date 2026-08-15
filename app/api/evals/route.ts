import { NextResponse } from "next/server";
import { evalSummary } from "@/lib/agent-evals";

export async function GET() {
  return NextResponse.json({ suite: "agent-safety-v0.6", ...evalSummary() });
}
