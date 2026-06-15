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
          <div className="nav-links">
            <span>Table</span>
            <span>Results</span>
            <span>Register</span>
          </div>
        </nav>
      </header>
      <section className="hero">
        <p className="eyebrow">Season tracker</p>
        <h1>The league, one result at a time</h1>
        <p className="subtitle">
          Register match results and watch the league table update automatically.
        </p>
      </section>
      <main>
        <Dashboard />
      </main>
    </>
  );
}
