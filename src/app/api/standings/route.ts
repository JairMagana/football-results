import { NextResponse } from "next/server";
import { calculateStandings } from "@/lib/standings";
import { getMatches, getTeams } from "@/lib/storage";

export async function GET() {
  const [teams, matches] = await Promise.all([getTeams(), getMatches()]);
  const standings = calculateStandings(teams, matches);
  return NextResponse.json(standings);
}
