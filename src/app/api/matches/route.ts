import { NextResponse } from "next/server";
import { getMatches } from "@/lib/storage";

export async function GET() {
  const matches = await getMatches();
  return NextResponse.json(matches);
}
