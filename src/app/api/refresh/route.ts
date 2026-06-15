import { NextResponse } from "next/server";
import { scrapeWorldCup } from "@/lib/scrape";
import { replaceData } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const { teams, matches } = await scrapeWorldCup();
    if (teams.length === 0 || matches.length === 0) {
      return NextResponse.json(
        { error: "No matches found while scraping." },
        { status: 502 }
      );
    }
    await replaceData(teams, matches);
    return NextResponse.json({ teams: teams.length, matches: matches.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Scrape failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
