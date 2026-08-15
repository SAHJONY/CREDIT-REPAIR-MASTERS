import { NextResponse } from "next/server";
import { checkNeonHealth } from "@/lib/neon-store";
import { isProductionEnvironment } from "@/lib/platform-store";

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    const production = isProductionEnvironment();
    return NextResponse.json({
      mode: production ? "unavailable" : "demo-memory",
      configured: false,
      connected: false,
      schemaReady: false,
      productionPersistenceActive: false,
      error: production ? "PRODUCTION_DATABASE_NOT_CONFIGURED" : undefined
    }, { status: production ? 503 : 200 });
  }
  try {
    const health = await checkNeonHealth(databaseUrl);
    return NextResponse.json({ mode: "neon-postgres", configured: true, ...health, productionPersistenceActive: health.connected && health.schemaReady }, { status: health.connected && health.schemaReady ? 200 : 503 });
  } catch (error) {
    return NextResponse.json({ mode: "neon-postgres", configured: true, connected: false, schemaReady: false, productionPersistenceActive: false, error: error instanceof Error ? error.message : "DATABASE_CONNECTION_FAILED" }, { status: 503 });
  }
}
