"use client";

import { FormEvent, useState } from "react";
import type { Team } from "@/lib/types";

interface MatchFormProps {
  teams: Team[];
  onMatchAdded: () => void;
}

export default function MatchForm({ teams, onMatchAdded }: MatchFormProps) {
  const [homeTeamId, setHomeTeamId] = useState(teams[0]?.id ?? "");
  const [awayTeamId, setAwayTeamId] = useState(teams[1]?.id ?? "");
  const [homeGoals, setHomeGoals] = useState("0");
  const [awayGoals, setAwayGoals] = useState("0");
  const [playedAt, setPlayedAt] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          homeTeamId,
          awayTeamId,
          homeGoals: Number(homeGoals),
          awayGoals: Number(awayGoals),
          playedAt,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Could not save the result.");
        return;
      }

      setHomeGoals("0");
      setAwayGoals("0");
      onMatchAdded();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="card">
      <div className="card-header">
        <h2>Register Result</h2>
      </div>
      <form className="match-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>
            Home team
            <select value={homeTeamId} onChange={(e) => setHomeTeamId(e.target.value)} required>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Away team
            <select value={awayTeamId} onChange={(e) => setAwayTeamId(e.target.value)} required>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="score-row">
          <label>
            Home goals
            <input
              type="number"
              min="0"
              value={homeGoals}
              onChange={(e) => setHomeGoals(e.target.value)}
              required
            />
          </label>
          <span className="score-separator">–</span>
          <label>
            Away goals
            <input
              type="number"
              min="0"
              value={awayGoals}
              onChange={(e) => setAwayGoals(e.target.value)}
              required
            />
          </label>
        </div>

        <label>
          Date played
          <input type="date" value={playedAt} onChange={(e) => setPlayedAt(e.target.value)} required />
        </label>

        {error && <p className="error">{error}</p>}

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Saving…" : "Save result"}
        </button>
      </form>
    </section>
  );
}
