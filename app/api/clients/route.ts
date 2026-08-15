import { NextResponse } from "next/server";
import { getPlatformStore } from "@/lib/platform-store";

export async function GET() {
  const store = getPlatformStore();
  return NextResponse.json({ mode: "demo-safe", clients: await store.listClients("org_demo") });
}
