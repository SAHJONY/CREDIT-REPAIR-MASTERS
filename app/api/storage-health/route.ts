import { NextResponse } from "next/server";
import { checkNeonHealth } from "@/lib/neon-store";

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return NextResponse.json({ mode: "demo-memory", configured: false, connected: false, schemaReady: false, productionPersistenceActive: false });
  try {
    const health = await checkNeonHealth(databaseUrl);
    return NextResponse.json({ mode: "neon-postgres", configured: true, ...health, productionPersistenceActive: health.connected && health.schemaReady });
  } catch (error) {
    return NextResponse.json({ mode: "neon-postgres", configured: true, connected: false, schemaReady: false, productionPersistenceActive: false, error: error instanceof Error ? error.message : "DATABASE_CONNECTION_FAILED" }, { status: 503 });
  }
}
