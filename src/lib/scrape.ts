import { chromium } from "playwright";
import type { Match, Team } from "./types";

const SOURCE_URL =
  "https://www.flashscore.com.mx/futbol/mundial/campeonato-del-mundo/resultados/";
const SEASON_YEAR = 2026;

interface RawMatch {
  date: string;
  home: string;
  away: string;
  homeGoals: number;
  awayGoals: number;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function toIsoDate(ddmm: string): string {
  const match = ddmm.match(/(\d{2})\.(\d{2})\./);
  if (!match) return `${SEASON_YEAR}-01-01`;
  const [, day, month] = match;
  return `${SEASON_YEAR}-${month}-${day}`;
}

export async function scrapeWorldCup(): Promise<{ teams: Team[]; matches: Match[] }> {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(SOURCE_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForSelector(".event__match", { timeout: 15000 });

    const raw: RawMatch[] = await page.evaluate(() => {
      const clean = (text: string | null | undefined) =>
        (text || "")
          .replace(/Equipo que avanza.*$|Vencedor.*$/i, "")
          .replace(/\d+$/, "")
          .trim();

      const nodes = [
        ...document.querySelectorAll('.headerLeague__wrapper, [class*="event__match"]'),
      ];
      const results: RawMatch[] = [];

      for (const node of nodes) {
        // Stop once we leave the World Cup finals and reach the qualifiers.
        if (node.classList.contains("headerLeague__wrapper")) {
          if (/clasificaci/i.test(node.textContent || "")) break;
          continue;
        }

        const time = node.querySelector(".event__time")?.textContent?.trim() || "";
        const home = clean(
          node.querySelector('[class*="event__homeParticipant"]')?.textContent ||
            node.querySelector(".event__participant--home")?.textContent
        );
        const away = clean(
          node.querySelector('[class*="event__awayParticipant"]')?.textContent ||
            node.querySelector(".event__participant--away")?.textContent
        );
        const hg = node.querySelector('[class*="event__score--home"]')?.textContent?.trim();
        const ag = node.querySelector('[class*="event__score--away"]')?.textContent?.trim();

        const homeGoals = Number(hg);
        const awayGoals = Number(ag);

        if (!home || !away || Number.isNaN(homeGoals) || Number.isNaN(awayGoals)) {
          continue;
        }

        results.push({ date: time, home, away, homeGoals, awayGoals });
      }

      return results;
    });

    const teamMap = new Map<string, Team>();
    const matches: Match[] = [];

    for (const r of raw) {
      const homeId = slugify(r.home);
      const awayId = slugify(r.away);
      if (!homeId || !awayId) continue;

      teamMap.set(homeId, { id: homeId, name: r.home });
      teamMap.set(awayId, { id: awayId, name: r.away });

      const playedAt = toIsoDate(r.date);
      matches.push({
        id: `${playedAt}-${homeId}-${awayId}`,
        homeTeamId: homeId,
        awayTeamId: awayId,
        homeGoals: r.homeGoals,
        awayGoals: r.awayGoals,
        playedAt,
      });
    }

    const teams = [...teamMap.values()].sort((a, b) => a.name.localeCompare(b.name));
    return { teams, matches };
  } finally {
    await browser.close();
  }
}
