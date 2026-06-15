"use client";

import { useCallback, useEffect, useState } from "react";
import FixturesCarousel from "./FixturesCarousel";
import GroupTables from "./GroupTables";
import MatchList from "./MatchList";
import type { Fixture, Group, Match, Team } from "@/lib/types";

export default function Dashboard() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const [groupsRes, teamsRes, matchesRes, fixturesRes] = await Promise.all([
      fetch("/api/groups"),
      fetch("/api/teams"),
      fetch("/api/matches"),
      fetch("/api/fixtures"),
    ]);

    const [groupsData, teamsData, matchesData, fixturesData] = await Promise.all([
      groupsRes.json(),
      teamsRes.json(),
      matchesRes.json(),
      fixturesRes.json(),
    ]);

    setGroups(groupsData);
    setTeams(teamsData);
    setMatches(matchesData);
    setFixtures(fixturesData);
    return { groupsData, matchesData };
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      await fetch("/api/refresh", { method: "POST" }).catch(() => {});
      const { groupsData, matchesData } = await load();
      if (groupsData.length === 0 && matchesData.length === 0) {
        setError("No results available yet.");
      }
    } catch {
      setError("Could not load results.");
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
      <FixturesCarousel fixtures={fixtures} />
      <GroupTables groups={groups} />
      <MatchList matches={matches} teams={teams} />
    </div>
  );
}
