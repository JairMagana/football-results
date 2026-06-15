"use client";

import type { StandingRow } from "@/lib/types";

interface LeagueTableProps {
  standings: StandingRow[];
}

export default function LeagueTable({ standings }: LeagueTableProps) {
  return (
    <section className="card">
      <div className="card-header">
        <h2>League Table</h2>
        <span className="badge">{standings.length} teams</span>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Team</th>
              <th>Pl</th>
              <th>W</th>
              <th>D</th>
              <th>L</th>
              <th>GF</th>
              <th>GA</th>
              <th>GD</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row, index) => (
              <tr key={row.teamId} className={getRowClass(index, standings.length)}>
                <td>{index + 1}</td>
                <td className="team-cell">{row.teamName}</td>
                <td>{row.played}</td>
                <td>{row.won}</td>
                <td>{row.drawn}</td>
                <td>{row.lost}</td>
                <td>{row.goalsFor}</td>
                <td>{row.goalsAgainst}</td>
                <td className={row.goalDifference > 0 ? "positive" : row.goalDifference < 0 ? "negative" : ""}>
                  {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                </td>
                <td className="points">{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="legend">
        <span className="legend-item champions">Top 3 — Podium</span>
        <span className="legend-item relegation">Bottom 3 — Relegation zone</span>
      </div>
    </section>
  );
}

function getRowClass(index: number, total: number): string {
  if (index < 3) return "zone-champions";
  if (index >= total - 3 && total > 3) return "zone-relegation";
  return "";
}
