import { NextRequest, NextResponse } from "next/server";
import { addMatch, deleteMatch, getMatches } from "@/lib/storage";

export async function GET() {
  const matches = await getMatches();
  return NextResponse.json(matches);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { homeTeamId, awayTeamId, homeGoals, awayGoals, playedAt } = body;

  if (!homeTeamId || !awayTeamId || playedAt === undefined) {
    return NextResponse.json(
      { error: "Home team, away team, and date are required." },
      { status: 400 }
    );
  }

  const result = await addMatch({
    homeTeamId,
    awayTeamId,
    homeGoals: Number(homeGoals),
    awayGoals: Number(awayGoals),
    playedAt,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result.match, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Match id is required." }, { status: 400 });
  }

  const deleted = await deleteMatch(id);
  if (!deleted) {
    return NextResponse.json({ error: "Match not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
