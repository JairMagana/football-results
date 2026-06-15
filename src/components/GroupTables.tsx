"use client";

import type { Group } from "@/lib/types";

interface GroupTablesProps {
  groups: Group[];
}

export default function GroupTables({ groups }: GroupTablesProps) {
  if (groups.length === 0) {
    return null;
  }

  return (
    <section className="groups">
      <div className="card-header">
        <h2>Groups</h2>
        <span className="badge">{groups.length} groups</span>
      </div>

      <div className="groups-grid">
        {groups.map((group) => (
          <div key={group.name} className="group-card">
            <div className="group-title">Group {group.name}</div>
            <table className="group-table">
              <thead>
                <tr>
                  <th className="group-team-col">Team</th>
                  <th>PL</th>
                  <th>W</th>
                  <th>D</th>
                  <th>L</th>
                  <th>GF</th>
                  <th>GA</th>
                  <th>GD</th>
                  <th>PTS</th>
                </tr>
              </thead>
              <tbody>
                {group.rows.map((row, idx) => (
                  <tr key={row.teamName}>
                    <td className="group-team-col">
                      <span className="group-pos">{idx + 1}</span>
                      {row.teamName}
                    </td>
                    <td>{row.played}</td>
                    <td>{row.won}</td>
                    <td>{row.drawn}</td>
                    <td>{row.lost}</td>
                    <td>{row.goalsFor}</td>
                    <td>{row.goalsAgainst}</td>
                    <td>{row.goalDifference}</td>
                    <td className="group-pts">{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </section>
  );
}
