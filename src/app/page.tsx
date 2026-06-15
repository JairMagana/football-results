import Dashboard from "@/components/Dashboard";

export default function Home() {
  return (
    <>
      <header className="site-header">
        <div className="header-content">
          <div className="logo-mark" aria-hidden="true">
            ⚽
          </div>
          <div>
            <p className="eyebrow">Season tracker</p>
            <h1>Football Results</h1>
            <p className="subtitle">
              Register match results and watch the league table update automatically.
            </p>
          </div>
        </div>
      </header>
      <main>
        <Dashboard />
      </main>
    </>
  );
}
