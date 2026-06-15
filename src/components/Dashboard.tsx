"use client";

import { useCallback, useEffect, useState } from "react";
import GroupTables from "./GroupTables";
import MatchList from "./MatchList";
import type { Group, Match, Team } from "@/lib/types";

export default function Dashboard() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const [groupsRes, teamsRes, matchesRes] = await Promise.all([
      fetch("/api/groups"),
      fetch("/api/teams"),
      fetch("/api/matches"),
    ]);

    const [groupsData, teamsData, matchesData] = await Promise.all([
      groupsRes.json(),
      teamsRes.json(),
      matchesRes.json(),
    ]);

    setGroups(groupsData);
    setTeams(teamsData);
    setMatches(matchesData);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/refresh", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (data.degraded) {
        setError("Showing last saved results. Live update unavailable right now.");
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
      <GroupTables groups={groups} />
      <MatchList matches={matches} teams={teams} />
    </div>
  );
}
