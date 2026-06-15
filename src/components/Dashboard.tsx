"use client";

import { useCallback, useEffect, useState } from "react";
import LeagueTable from "./LeagueTable";
import MatchList from "./MatchList";
import type { Match, StandingRow, Team } from "@/lib/types";

export default function Dashboard() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
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
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/refresh", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Could not update results.");
      }
      await load();
    } catch {
      setError("Network error while updating results.");
      await load();
    } finally {
      setLoading(false);
    }
  }, [load]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (loading) {
    return <p className="loading">Updating results from Flashscore…</p>;
  }

  return (
    <div className="dashboard-single">
      {error && <p className="error banner">{error}</p>}
      <LeagueTable standings={standings} />
      <MatchList matches={matches} teams={teams} />
    </div>
  );
}
