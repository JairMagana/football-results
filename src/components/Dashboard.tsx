"use client";

import { useCallback, useEffect, useState } from "react";
import LeagueTable from "./LeagueTable";
import MatchForm from "./MatchForm";
import MatchList from "./MatchList";
import type { Match, StandingRow, Team } from "@/lib/types";

export default function Dashboard() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [teamsRes, matchesRes, standingsRes] = await Promise.all([
      fetch("/api/teams"),
      fetch("/api/matches"),
      fetch("/api/standings"),
    ]);

    const [teamsData, matchesData, standingsData] = await Promise.all([
      teamsRes.json(),
      matchesRes.json(),
      standingsRes.json(),
    ]);

    setTeams(teamsData);
    setMatches(matchesData);
    setStandings(standingsData);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (loading) {
    return <p className="loading">Loading league data…</p>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-main">
        <LeagueTable standings={standings} />
        <MatchList matches={matches} teams={teams} onMatchDeleted={refresh} />
      </div>
      <aside className="dashboard-sidebar">
        <MatchForm teams={teams} onMatchAdded={refresh} />
      </aside>
    </div>
  );
}
