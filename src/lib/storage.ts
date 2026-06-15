import { promises as fs } from "fs";
import path from "path";
import type { Group, Match, Team } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const TEAMS_FILE = path.join(DATA_DIR, "teams.json");
const MATCHES_FILE = path.join(DATA_DIR, "matches.json");
const GROUPS_FILE = path.join(DATA_DIR, "groups.json");

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJsonFile<T>(filePath: string, data: T) {
  await ensureDataDir();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function getTeams(): Promise<Team[]> {
  return readJsonFile(TEAMS_FILE, []);
}

export async function getMatches(): Promise<Match[]> {
  return readJsonFile(MATCHES_FILE, []);
}

export async function getGroups(): Promise<Group[]> {
  return readJsonFile(GROUPS_FILE, []);
}

export async function replaceData(
  groups: Group[],
  teams: Team[],
  matches: Match[]
): Promise<void> {
  await writeJsonFile(GROUPS_FILE, groups);
  await writeJsonFile(TEAMS_FILE, teams);
  await writeJsonFile(MATCHES_FILE, matches);
}
