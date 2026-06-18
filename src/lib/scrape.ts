import * as cheerio from "cheerio";
import type { Fixture, Group, Match, Team } from "./types";

const STANDINGS_URL = "https://flashscore.com.mx";
const RESULTS_URL = "https://flashscore.com.mx";
const FIXTURES_URL = "https://flashscore.com.mx";
const SEASON_YEAR = 2026;

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

function toKickoff(value: string): string {
  const match = value.match(/(\d{2})\.(\d{2})\.\s*(\d{2}:\d{2})/);
  if (!match) return `${SEASON_YEAR}-01-01T00:00`;
  const [, day, month, time] = match;
  return `${SEASON_YEAR}-${month}-${day}T${time}`;
}

// 1. SCRAPE DE RESULTADOS DE PARTIDOS JUGADOS
async function scrapeResults(): Promise<{ teams: Team[]; matches: Match[] }> {
  const res = await fetch(RESULTS_URL, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al consultar la URL de resultados");
  const html = await res.text();
  const $ = cheerio.load(html);

  const teamMap = new Map<string, Team>();
  const matches: Match[] = [];

  // En la versión móvil, los partidos suelen estar dentro de un id o contenedor principal
  // Buscamos los bloques de texto que contienen "Equipo A - Equipo B G-P"
  $("#my-games-table, .soccer, body").find("h4, div").each((_, el) => {
    const text = $(el).text().trim();
    
    // Filtro regex para detectar partidos completados (Ej: "11:00 Portugal - RD Congo 1-1")
    const matchRegex = /^(\d{2}:\d{2})\s+(.+?)\s+-\s+(.+?)\s+(\d+)-(\d+)$/;
    const parsed = text.match(matchRegex);

    if (parsed) {
      const [, time, home, away, hg, ag] = parsed;
      const homeId = slugify(home);
      const awayId = slugify(away);

      if (homeId && awayId) {
        teamMap.set(homeId, { id: homeId, name: home });
        teamMap.set(awayId, { id: awayId, name: away });

        // Simulamos la fecha de hoy para el histórico diario en la versión móvil
        const playedAt = new Date().toISOString().split('T')[0]; 
        
        matches.push({
          id: `${playedAt}-${homeId}-${awayId}`,
          homeTeamId: homeId,
          awayTeamId: awayId,
          homeGoals: Number(hg),
          awayGoals: Number(ag),
          playedAt,
        });
      }
    }
  });

  const teams = [...teamMap.values()].sort((a, b) => a.name.localeCompare(b.name));
  return { teams, matches };
}

// 2. SCRAPE DE CALENDARIO / PRÓXIMOS PARTIDOS
async function scrapeFixtures(): Promise<Fixture[]> {
  const res = await fetch(FIXTURES_URL, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al consultar la URL de fixtures");
  const html = await res.text();
  const $ = cheerio.load(html);

  const fixtures: Fixture[] = [];

  $("body").find("div, p").each((_, el) => {
    const text = $(el).text().trim();
    // Filtro regex para partidos sin jugar (Ej: "14:00 España - Alemania -")
    const fixtureRegex = /^(\d{2}:\d{2})\s+(.+?)\s+-\s+(.+?)\s+-$/;
    const parsed = text.match(fixtureRegex);

    if (parsed) {
      const [, time, home, away] = parsed;
      const today = new Date();
      const kickoff = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}T${time}`;

      fixtures.push({
        id: `${kickoff}-${slugify(home)}-${slugify(away)}`,
        homeTeam: home,
        awayTeam: away,
        kickoff,
      });
    }
  });

  return fixtures.sort((a, b) => a.kickoff.localeCompare(b.kickoff));
}

// 3. SCRAPE DE TABLAS DE GRUPOS / CLASIFICACIONES
async function scrapeGroups(): Promise<Group[]> {
  const res = await fetch(STANDINGS_URL, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al consultar la URL de clasificaciones");
  const html = await res.text();
  const $ = cheerio.load(html);

  const groups: Group[] = [];
  // Aquí puedes mapear las tablas de clasificaciones leyendo las etiquetas estándar <table> o los renglones correspondientes
  return groups;
}

// FUNCIÓN PRINCIPAL EXPORTADA
export async function scrapeWorldCup(): Promise<{
  groups: Group[];
  teams: Team[];
  matches: Match[];
  fixtures: Fixture[];
}> {
  const { teams, matches } = await scrapeResults();
  const fixtures = await scrapeFixtures();
  const groups = await scrapeGroups();

  return { groups, teams, matches, fixtures };
}
