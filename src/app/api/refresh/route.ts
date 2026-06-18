import { NextResponse } from "next/server";
import { scrapeWorldCup } from "@/lib/scrape";
import { replaceData } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  console.log("REFRESH EJECUTADO", new Date().toISOString());
  try {
    const { groups, teams, matches, fixtures } = await scrapeWorldCup();
    if (groups.length === 0 && matches.length === 0) {
      return NextResponse.json({ degraded: true, reason: "No data scraped." });
    }
    await replaceData(groups, teams, matches, fixtures);
    console.log(
  "SCRAPE:",
  "groups=", groups.length,
  "teams=", teams.length,
  "matches=", matches.length,
  "fixtures=", fixtures.length
);
    return NextResponse.json({
      groups: groups.length,
      teams: teams.length,
      matches: matches.length,
      fixtures: fixtures.length,
    });
  } catch (err) {
    // A browser may not be available at runtime (e.g. serverless/sandbox).
    // Fail soft so the app keeps serving the last saved data.
    const message = err instanceof Error ? err.message : "Scrape failed.";
    return NextResponse.json({ degraded: true, reason: message });
  }
}
