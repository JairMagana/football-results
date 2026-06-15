import Dashboard from "@/components/Dashboard";

export default function Home() {
  return (
    <>
      <header className="site-header">
        <nav className="nav-bar">
          <div className="brand">
            <span className="logo-mark" aria-hidden="true">
              ⚽
            </span>
            Football Results
          </div>
        </nav>
      </header>
      <section className="hero">
        <p className="eyebrow">World Cup 2026</p>
        <h1>Every result, updated live</h1>
        <p className="subtitle">
          Match results pulled automatically from Flashscore, with the standings
          recalculated on every visit.
        </p>
      </section>
      <main>
        <Dashboard />
      </main>
    </>
  );
}
