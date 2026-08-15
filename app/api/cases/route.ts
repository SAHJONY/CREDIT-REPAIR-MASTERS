import { NextResponse } from "next/server";
import { demoEvidence, demoProfile } from "@/lib/demo";
import { buildBrainSnapshot } from "@/lib/orchestrator";

export async function GET() {
  const snapshot = buildBrainSnapshot(demoProfile, demoEvidence);
  return NextResponse.json({ mode: "demo-safe", cases: snapshot.cases, evidence: snapshot.evidence });
}
