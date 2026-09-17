import { NextRequest, NextResponse } from "next/server";
import { authenticateBusinessUser, authorizeRoles } from "@/lib/api-auth";
import {
  getIntakeCase,
  getIntakeCaseWithPhone,
  setCaseStatus,
  describePipelineState,
  INTAKE_STATUSES,
} from "@/lib/owner-intake";

/** GET — case detail. Phones masked unless ?reveal=pii (owner role only, audit-logged). */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = authorizeRoles(await authenticateBusinessUser(request), ["owner", "admin"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const reveal = request.nextUrl.searchParams.get("reveal") === "pii";
  if (reveal && auth.role !== "owner") {
    return NextResponse.json({ error: "ROLE_NOT_AUTHORIZED" }, { status: 403 });
  }

  const found = reveal
    ? getIntakeCaseWithPhone(id, auth.organizationId, auth.actorId)
    : getIntakeCase(id, auth.organizationId);
  if (!found) return NextResponse.json({ error: "INTAKE_CASE_NOT_FOUND" }, { status: 404 });

  return NextResponse.json({
    case: { ...found, pipeline: describePipelineState(found, "es") },
    piiRevealed: reveal,
  });
}

/** PATCH — move the workflow status. Owner/admin only. */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = authorizeRoles(await authenticateBusinessUser(request), ["owner", "admin"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }
  const status = (body as { status?: string })?.status;
  if (!status || !(INTAKE_STATUSES as string[]).includes(status)) {
    return NextResponse.json({ error: "INTAKE_STATUS_INVALID" }, { status: 400 });
  }

  try {
    const updated = setCaseStatus(id, auth.organizationId, status as (typeof INTAKE_STATUSES)[number], auth.actorId);
    return NextResponse.json({ case: { ...updated, pipeline: describePipelineState(updated, "es") } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "INTAKE_STATUS_FAILED";
    const code = message.split(":")[0] || "INTAKE_STATUS_FAILED";
    const http = code === "INTAKE_CASE_NOT_FOUND" ? 404 : 400;
    return NextResponse.json({ error: code }, { status: http });
  }
}
