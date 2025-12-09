import React, { useMemo } from "react";
import { useAppData } from "../data/AppDataContext.jsx";

const VIEW_OPTIONS = ["This week", "This month", "All time"];

export default function Leaderboard() {
  const {
    leaderboardUsers,
    leaderboardLoading,
    leaderboardError,
    leaderboardView,
    setLeaderboardView,
  } = useAppData();

  const selectedView = leaderboardView || "All time";

  const sortedUsers = useMemo(
    () =>
      [...leaderboardUsers].sort(
        (a, b) => (b.weeklyPoints || 0) - (a.weeklyPoints || 0)
      ),
    [leaderboardUsers]
  );

  const getRank = (user, index) =>
    user.rank != null ? user.rank : index + 1;

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
            onClick={() => setLeaderboardView(view)}
          >
            {view}
          </button>
        ))}
      </div>

      {leaderboardLoading && (
        <p className="leaderboard-status">Loading leaderboard…</p>
      )}
      {leaderboardError && (
        <p className="leaderboard-status leaderboard-status--error">
          {leaderboardError}
        </p>
      )}

      {!leaderboardLoading &&
        !leaderboardError &&
        sortedUsers.length === 0 && (
          <p className="leaderboard-status">No data available yet.</p>
        )}

      {!leaderboardLoading &&
        !leaderboardError &&
        sortedUsers.length > 0 && (
          <>
            <section className="leaderboard-table-wrapper">
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Participant</th>
                    <th>Points</th>
                    <th>Total CO₂ Saved (kg)</th>
                    <th>Streak (days)</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedUsers.map((user, index) => (
                    <tr
                      key={user.userId ?? index}
                      className={
                        user.isCurrentUser
                          ? "leaderboard-row leaderboard-row--me"
                          : "leaderboard-row"
                      }
                    >
                      <td>{getRank(user, index)}</td>
                      <td>{user.displayName}</td>
                      <td>{user.weeklyPoints}</td>
                      <td>
                        {typeof user.totalCo2Saved === "number"
                          ? user.totalCo2Saved.toFixed(2)
                          : user.totalCo2Saved}
                      </td>
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
