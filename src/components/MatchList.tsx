"use client";

import type { Match, Team } from "@/lib/types";

interface MatchListProps {
  matches: Match[];
  teams: Team[];
  onMatchDeleted: () => void;
}

export default function MatchList({ matches, teams, onMatchDeleted }: MatchListProps) {
  const teamMap = new Map(teams.map((team) => [team.id, team.name]));
  const sortedMatches = [...matches].sort(
    (a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime()
  );

  async function handleDelete(id: string) {
    const response = await fetch(`/api/matches?id=${id}`, { method: "DELETE" });
    if (response.ok) onMatchDeleted();
  }

  return (
    <section className="card">
      <div className="card-header">
        <h2>Recent Results</h2>
        <span className="badge">{matches.length} matches</span>
      </div>

      {sortedMatches.length === 0 ? (
        <p className="empty-state">No results yet. Register your first match above.</p>
      ) : (
        <ul className="match-list">
          {sortedMatches.map((match) => (
            <li key={match.id} className="match-item">
              <div className="match-date">{formatDate(match.playedAt)}</div>
              <div className="match-scoreline">
                <span className="match-team">{teamMap.get(match.homeTeamId) ?? "Unknown"}</span>
                <span className="match-score">
                  {match.homeGoals} – {match.awayGoals}
                </span>
                <span className="match-team">{teamMap.get(match.awayTeamId) ?? "Unknown"}</span>
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => handleDelete(match.id)}
                aria-label="Delete match"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
