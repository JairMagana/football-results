import { promises as fs } from "fs";
import path from "path";
import type { Match, Team } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const TEAMS_FILE = path.join(DATA_DIR, "teams.json");
const MATCHES_FILE = path.join(DATA_DIR, "matches.json");

const DEFAULT_TEAMS: Team[] = [
  { id: "arsenal", name: "Arsenal" },
  { id: "aston-villa", name: "Aston Villa" },
  { id: "bournemouth", name: "Bournemouth" },
  { id: "brentford", name: "Brentford" },
  { id: "brighton", name: "Brighton" },
  { id: "chelsea", name: "Chelsea" },
  { id: "crystal-palace", name: "Crystal Palace" },
  { id: "everton", name: "Everton" },
  { id: "fulham", name: "Fulham" },
  { id: "ipswich", name: "Ipswich Town" },
  { id: "leicester", name: "Leicester City" },
  { id: "liverpool", name: "Liverpool" },
  { id: "man-city", name: "Manchester City" },
  { id: "man-utd", name: "Manchester United" },
  { id: "newcastle", name: "Newcastle United" },
  { id: "nottingham", name: "Nottingham Forest" },
  { id: "southampton", name: "Southampton" },
  { id: "tottenham", name: "Tottenham Hotspur" },
  { id: "west-ham", name: "West Ham United" },
  { id: "wolves", name: "Wolverhampton Wanderers" },
];

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    await fs.writeFile(filePath, JSON.stringify(fallback, null, 2), "utf-8");
    return fallback;
  }
}

async function writeJsonFile<T>(filePath: string, data: T) {
  await ensureDataDir();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function getTeams(): Promise<Team[]> {
  return readJsonFile(TEAMS_FILE, DEFAULT_TEAMS);
}

export async function getMatches(): Promise<Match[]> {
  return readJsonFile(MATCHES_FILE, []);
}

export async function replaceData(teams: Team[], matches: Match[]): Promise<void> {
  await writeJsonFile(TEAMS_FILE, teams);
  await writeJsonFile(MATCHES_FILE, matches);
}

export async function addMatch(
  match: Omit<Match, "id">
): Promise<{ match: Match } | { error: string }> {
  const teams = await getTeams();
  const matches = await getMatches();

  if (match.homeTeamId === match.awayTeamId) {
    return { error: "A team cannot play against itself." };
  }

  const homeExists = teams.some((team) => team.id === match.homeTeamId);
  const awayExists = teams.some((team) => team.id === match.awayTeamId);
  if (!homeExists || !awayExists) {
    return { error: "Both teams must exist in the league." };
  }

  if (match.homeGoals < 0 || match.awayGoals < 0) {
    return { error: "Goals cannot be negative." };
  }

  const newMatch: Match = {
    ...match,
    id: crypto.randomUUID(),
  };

  matches.push(newMatch);
  await writeJsonFile(MATCHES_FILE, matches);
  return { match: newMatch };
}

export async function deleteMatch(id: string): Promise<boolean> {
  const matches = await getMatches();
  const nextMatches = matches.filter((match) => match.id !== id);
  if (nextMatches.length === matches.length) return false;
  await writeJsonFile(MATCHES_FILE, nextMatches);
  return true;
}
