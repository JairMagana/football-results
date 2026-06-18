import { chromium, type Browser } from "playwright";
import type { Fixture, Group, Match, Team } from "./types";

const STANDINGS_URL =
  "https://www.flashscore.com.mx/futbol/mundial/campeonato-del-mundo/clasificacion/";
const RESULTS_URL =
  "https://www.flashscore.com.mx/futbol/mundial/campeonato-del-mundo/resultados/";
const FIXTURES_URL =
  "https://www.flashscore.com.mx/futbol/mundial/campeonato-del-mundo/partidos/";
const SEASON_YEAR = 2026;

interface RawMatch {
  date: string;
  home: string;
  away: string;
  homeGoals: number;
  awayGoals: number;
}

interface RawFixture {
  time: string;
  home: string;
  away: string;
}

function toKickoff(value: string): string {
  const match = value.match(/(\d{2})\.(\d{2})\.\s*(\d{2}:\d{2})/);
  if (!match) return `${SEASON_YEAR}-01-01T00:00`;
  const [, day, month, time] = match;
  return `${SEASON_YEAR}-${month}-${day}T${time}`;
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

async function scrapeGroups(browser: Browser): Promise<Group[]> {
  const page = await browser.newPage();
  try {
    await page.goto(STANDINGS_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.screenshot({ path: "debug-results.png", fullPage: true });
    //await page.waitForSelector(".ui-table__row", { timeout: 15000 });
    await page.waitForTimeout(8000);

    return await page.evaluate(() => {
      const nodes = [
        ...document.querySelectorAll(".table__headerCell--participant, .ui-table__row"),
      ];

      type Row = {
        teamName: string;
        played: number;
        won: number;
        drawn: number;
        lost: number;
        goalsFor: number;
        goalsAgainst: number;
        goalDifference: number;
        points: number;
      };
      const groups: { name: string; rows: Row[] }[] = [];
      let current: { name: string; rows: Row[] } | null = null;

      for (const node of nodes) {
        const text = (node.textContent || "").trim();
        const header = text.match(/^Grupo ([A-L])$/);
        if (header) {
          current = { name: header[1], rows: [] };
          groups.push(current);
          continue;
        }
        if (!current || !node.classList.contains("ui-table__row")) continue;

        const cells = [...node.children].map((c) => (c.textContent || "").trim());
        const teamName = cells[1];
        const goalsIdx = cells.findIndex((c) => /^\d+:\d+$/.test(c));
        if (!teamName || goalsIdx < 0) continue;

        const [goalsFor, goalsAgainst] = cells[goalsIdx].split(":").map(Number);
        current.rows.push({
          teamName,
          played: Number(cells[goalsIdx - 4]),
          won: Number(cells[goalsIdx - 3]),
          drawn: Number(cells[goalsIdx - 2]),
          lost: Number(cells[goalsIdx - 1]),
          goalsFor,
          goalsAgainst,
          goalDifference: goalsFor - goalsAgainst,
          points: Number(cells[goalsIdx + 2]),
        });
      }

      return groups.filter((g) => g.rows.length > 0);
    });
  } finally {
    await page.close();
  }
}

async function scrapeResults(browser: Browser): Promise<{ teams: Team[]; matches: Match[] }> {
  const page = await browser.newPage();
  try {
    await page.goto(RESULTS_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForSelector(".event__match", { timeout: 15000 });
    await page.waitForTimeout(5000);
    
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
        if (node.classList.contains("headerLeague__wrapper")) {
          if (/clasificaci/i.test(node.textContent || "")) continue;
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
        if (!home || !away || Number.isNaN(homeGoals) || Number.isNaN(awayGoals)) continue;

        results.push({ date: time, home, away, homeGoals, awayGoals });
      }
      console.log("NODOS ENCONTRADOS:", nodes.length);
      console.log("RESULTADOS ENCONTRADOS:", results.length);
      return results;
    });

     throw new Error(`RAW MATCHES: ${raw.length}`);
    
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
    await page.close();
  }
}

async function scrapeFixtures(browser: Browser): Promise<Fixture[]> {
  const page = await browser.newPage();
  try {
    await page.goto(FIXTURES_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForSelector(".event__match", { timeout: 15000 });

    const raw: RawFixture[] = await page.evaluate(() => {
      const clean = (text: string | null | undefined) =>
        (text || "")
          .replace(/Equipo que avanza.*$|Vencedor.*$/i, "")
          .replace(/\d+$/, "")
          .trim();

      const nodes = [
        ...document.querySelectorAll('.headerLeague__wrapper, [class*="event__match"]'),
      ];
      const results: RawFixture[] = [];

      for (const node of nodes) {
        if (node.classList.contains("headerLeague__wrapper")) {
          if (/clasificaci/i.test(node.textContent || "")) continue;
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

        if (!home || !away || !time) continue;
        results.push({ time, home, away });
      }

      return results;
    });

    const fixtures: Fixture[] = [];
    for (const r of raw) {
      const kickoff = toKickoff(r.time);
      fixtures.push({
        id: `${kickoff}-${slugify(r.home)}-${slugify(r.away)}`,
        homeTeam: r.home,
        awayTeam: r.away,
        kickoff,
      });
    }

    fixtures.sort((a, b) => a.kickoff.localeCompare(b.kickoff));
    return fixtures;
  } finally {
    await page.close();
  }
}

export async function scrapeWorldCup(): Promise<{
  groups: Group[];
  teams: Team[];
  matches: Match[];
  fixtures: Fixture[];
}> {
  const browser = await chromium.launch({ headless: true });
  try {
    const groups = await scrapeGroups(browser);
    const { teams, matches } = await scrapeResults(browser);
    const fixtures = await scrapeFixtures(browser);
    return { groups, teams, matches, fixtures };
  } finally {
    await browser.close();
  }
}
