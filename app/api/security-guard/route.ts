import { NextResponse } from "next/server";
import { secureModelInput } from "@/lib/security-guard";

export async function POST(request: Request) {
  const body = (await request.json()) as { text?: string };
  if (typeof body.text !== "string") return NextResponse.json({ error: "text is required" }, { status: 400 });
  return NextResponse.json(secureModelInput(body.text));
}
