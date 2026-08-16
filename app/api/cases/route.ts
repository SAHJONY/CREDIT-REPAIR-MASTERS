import { NextRequest, NextResponse } from "next/server";
import { authenticateBusinessUser, authorizeRoles } from "@/lib/api-auth";
import { getPlatformStore } from "@/lib/platform-store";

export async function GET(request: NextRequest) {
  const auth = authorizeRoles(
    await authenticateBusinessUser(request),
    ["owner", "admin", "credit_specialist", "compliance_reviewer", "auditor"]
  );
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const clientId = request.nextUrl.searchParams.get("clientId")?.trim();
  if (!clientId) return NextResponse.json({ error: "CLIENT_ID_REQUIRED" }, { status: 400 });

  try {
    const store = getPlatformStore();
    const client = await store.getClient(auth.organizationId, clientId);
    if (!client) return NextResponse.json({ error: "CLIENT_NOT_FOUND" }, { status: 404 });

    const evidence = await store.listEvidence(auth.organizationId, client.id);
    return NextResponse.json({
      organizationId: auth.organizationId,
      client,
      cases: [],
      evidence,
      caseEngine: {
        status: "credit_snapshot_required",
        persistedCases: false,
        note: "No case is synthesized until a validated client credit snapshot is supplied or an authorized credit-data provider is connected."
      }
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "CASE_DATA_UNAVAILABLE";
    return NextResponse.json({ error: code }, { status: 503 });
  }
}
