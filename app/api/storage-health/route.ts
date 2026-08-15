import { NextResponse } from "next/server";
import { pingNeon } from "@/lib/neon-store";

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return NextResponse.json({ mode: "demo-memory", configured: false, connected: false, productionPersistenceActive: false });
  try {
    const connected = await pingNeon(databaseUrl);
    return NextResponse.json({ mode: "neon-postgres", configured: true, connected, productionPersistenceActive: connected });
  } catch (error) {
    return NextResponse.json({ mode: "neon-postgres", configured: true, connected: false, productionPersistenceActive: false, error: error instanceof Error ? error.message : "DATABASE_CONNECTION_FAILED" }, { status: 503 });
  }
}
