import { NextResponse } from "next/server";
import { demoEvidence, demoProfile } from "@/lib/demo";
import { buildBrainSnapshot } from "@/lib/orchestrator";
import { buildEvidenceMatrix } from "@/lib/evidence-integrity";

export async function GET() {
  const snapshot = buildBrainSnapshot(demoProfile, demoEvidence);
  return NextResponse.json({
    version: "1.2.0",
    mode: "demo-safe",
    fingerprintType: "sha256-metadata-fingerprint",
    note: "Metadata fingerprints are not substitutes for document-byte checksums.",
    matrix: buildEvidenceMatrix(snapshot.cases, snapshot.evidence)
  });
}
