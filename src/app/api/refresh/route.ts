import { NextResponse } from "next/server";
import { scrapeWorldCup } from "@/lib/scrape";
import { replaceData } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60; // <--- OBLIGATORIO PARA VERCEL: Amplía el tiempo de scraping a 60 segundos

export async function POST() {
  console.log("REFRESH EJECUTADO", new Date().toISOString());
  try {
    const { groups, teams, matches, fixtures } = await scrapeWorldCup();
    
    if (groups.length === 0 && matches.length === 0) {
      return NextResponse.json(
        { degraded: true, reason: "No data scraped." },
        { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
      );
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
      firstMatch: matches[0],
      lastMatch: matches[matches.length - 1],
    }, {
      // Forzamos a Vercel y al cliente a ignorar cualquier respuesta anterior
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      }
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Scrape failed.";
    console.error("ERROR EN REFRESH:", message); // Agregamos log para que lo veas en Vercel
    
    return NextResponse.json(
      { degraded: true, reason: message },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  }
}

