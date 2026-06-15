import { NextResponse } from "next/server";
import { getFixtures } from "@/lib/storage";

export async function GET() {
  const fixtures = await getFixtures();
  return NextResponse.json(fixtures);
}
