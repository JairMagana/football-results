export interface Team {
  id: string;
  name: string;
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeGoals: number;
  awayGoals: number;
  playedAt: string;
}

export interface GroupRow {
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface Group {
  name: string;
  rows: GroupRow[];
}
