"use client";

import type { Fixture } from "@/lib/types";

interface FixturesCarouselProps {
  fixtures: Fixture[];
}

export default function FixturesCarousel({ fixtures }: FixturesCarouselProps) {
  const sorted = [...fixtures].sort((a, b) => a.kickoff.localeCompare(b.kickoff));
  const future = sorted.filter((f) => new Date(f.kickoff).getTime() >= Date.now());
  const upcoming = future.length > 0 ? future : sorted;

  if (upcoming.length === 0) {
    return null;
  }

  const track = [...upcoming, ...upcoming];

  return (
    <section className="fixtures-banner" aria-label="Upcoming matches">
      <span className="fixtures-label">Upcoming</span>
      <div className="fixtures-viewport">
        <div className="fixtures-track">
          {track.map((fixture, idx) => (
            <div className="fixture-chip" key={`${fixture.id}-${idx}`} aria-hidden={idx >= upcoming.length}>
              <span className="fixture-kickoff">{formatKickoff(fixture.kickoff)}</span>
              <span className="fixture-team">{fixture.homeTeam}</span>
              <span className="fixture-vs">vs</span>
              <span className="fixture-team">{fixture.awayTeam}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function formatKickoff(value: string): string {
  const date = new Date(value);
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
