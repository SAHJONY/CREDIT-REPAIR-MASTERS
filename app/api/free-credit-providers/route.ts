import { NextResponse } from "next/server";
import { getFreeCreditProviderCatalog } from "@/lib/credit-data-providers";

export async function GET() {
  return NextResponse.json(getFreeCreditProviderCatalog());
}
