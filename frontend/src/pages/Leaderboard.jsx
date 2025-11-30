import React, { useEffect, useMemo, useState } from "react";

const VIEW_OPTIONS = ["This week", "This month", "All time"];

const VIEW_PARAM_MAP = {
  "This week": "week",
  "This month": "month",
  "All time": "all",
};

export default function Leaderboard() {
  const [selectedView, setSelectedView] = useState("This week");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchLeaderboard() {
      setLoading(true);
      setError(null);

      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        const viewParam = VIEW_PARAM_MAP[selectedView] || "week";

        const res = await fetch(
          `${baseUrl}/api/leaderboard?view=${viewParam}&limit=50&offset=0`,
          {
            method: "GET",
            signal: controller.signal,
          }
        );

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        setUsers(data.users ?? []);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Failed to load leaderboard", err);
        setError("Could not load leaderboard. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();

    return () => controller.abort();
  }, [selectedView]);

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => (b.weeklyPoints || 0) - (a.weeklyPoints || 0));
  }, [users]);

  const topThree = sortedUsers.slice(0, 3);
  const rest = sortedUsers.slice(3);

  return (
    <div className="leaderboard-page">
      <header className="leaderboard-header">
        <h1>Leaderboard</h1>
        <p>See how you stack up against other eco-heroes.</p>
      </header>

      <div className="leaderboard-view-toggle">
        {VIEW_OPTIONS.map((view) => (
          <button
            key={view}
            type="button"
            className={`view-toggle-btn ${
              selectedView === view ? "view-toggle-btn--active" : ""
            }`}
            onClick={() => setSelectedView(view)}
          >
            {view}
          </button>
        ))}
      </div>

      {loading && <p className="leaderboard-status">Loading leaderboard…</p>}
      {error && <p className="leaderboard-status leaderboard-status--error">{error}</p>}

      {!loading && !error && sortedUsers.length === 0 && (
        <p className="leaderboard-status">No data available yet.</p>
      )}

      {!loading && !error && sortedUsers.length > 0 && (
        <>
          <section className="leaderboard-podium">
            {topThree.map((user, index) => (
              <div
                key={user.userId ?? index}
                className={`leaderboard-podium-item leaderboard-podium-item--${
                  index + 1
                }`}
              >
                <div className="leaderboard-podium-rank">#{index + 1}</div>
                <div className="leaderboard-podium-name">{user.displayName}</div>
                <div className="leaderboard-podium-points">
                  {user.weeklyPoints} pts
                </div>
              </div>
            ))}
          </section>

          <section className="leaderboard-table-wrapper">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Participant</th>
                  <th>Weekly Points</th>
                  <th>Total CO₂ Saved (kg)</th>
                  <th>Streak (days)</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map((user, index) => (
                  <tr key={user.userId ?? index}>
                    <td>{index + 1}</td>
                    <td>{user.displayName}</td>
                    <td>{user.weeklyPoints}</td>
                    <td>{user.totalCo2Saved}</td>
                    <td>{user.streakDays}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  );
}
