import React, { useMemo } from "react";
import { useAppData } from "../data/AppDataContext.jsx";

const VIEW_OPTIONS = ["This week", "This month", "All time"];

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatKg(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  if (value === 0) return "0";
  if (value < 10) return value.toFixed(2);
  if (value < 100) return value.toFixed(1);
  return Math.round(value).toString();
}

export default function Leaderboard() {
  const {
    leaderboardUsers,
    leaderboardLoading,
    leaderboardError,
    leaderboardView,
    setLeaderboardView,
  } = useAppData();

  const selectedView = leaderboardView || "All time";

  const sortedUsers = useMemo(() => {
    const copy = [...leaderboardUsers];
    copy.sort((a, b) => {
      const rankA = a.rank ?? Number.MAX_SAFE_INTEGER;
      const rankB = b.rank ?? Number.MAX_SAFE_INTEGER;
      if (rankA !== rankB) return rankA - rankB;
      return (b.weeklyPoints || 0) - (a.weeklyPoints || 0);
    });
    return copy;
  }, [leaderboardUsers]);

  const podium = sortedUsers.slice(0, 3);
  const currentUser = sortedUsers.find((u) => u.isCurrentUser);
  const participantsCount = sortedUsers.length;

  const viewLabel =
    selectedView === "All time"
      ? "all time"
      : selectedView === "This week"
      ? "this week"
      : "this month";

  return (
    <div className="leaderboard-page">
      <header className="leaderboard-header">
        <div>
          <h1 className="page-title">Community Leaderboard</h1>
          <p className="section-subtitle">
            Track your carbon footprint progress and see how you stack up
            against other people in the GreenLoop community.
          </p>
        </div>

        <div className="leaderboard-view-toggle">
          <div className="view-toggle" role="tablist" aria-label="Leaderboard range">
            {VIEW_OPTIONS.map((view) => (
              <button
                key={view}
                type="button"
                role="tab"
                aria-selected={selectedView === view}
                className={
                  "toggle-chip" + (selectedView === view ? " toggle-chip--active" : "")
                }
                onClick={() => setLeaderboardView(view)}
              >
                {view}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="leaderboard-layout">
        {/* MAIN COLUMN: podium + table */}
        <section className="leaderboard-card leaderboard-main-card">
          <div className="card-header-row">
            <div>
              <h2>Rankings</h2>
              <p className="small-label">
                {participantsCount > 0
                  ? `Showing: ${viewLabel} • ${participantsCount} participant${
                      participantsCount === 1 ? "" : "s"
                    }`
                  : `No participants yet for ${viewLabel}.`}
              </p>
            </div>
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
            participantsCount > 0 && (
              <>
                {/* TOP 3 CARDS */}
                <div className="podium-row">
                  {podium.map((user, index) => (
                    <article
                      key={user.userId ?? index}
                      className={
                        "podium-card " +
                        (index === 0
                          ? "podium-card--gold"
                          : index === 1
                          ? "podium-card--silver"
                          : "podium-card--bronze")
                      }
                    >
                      <div className="podium-rank">#{user.rank ?? index + 1}</div>
                      <div className="avatar-circle avatar-circle--small">
                        <span>{getInitials(user.displayName)}</span>
                      </div>
                      <div className="podium-name">{user.displayName}</div>
                      <div className="podium-stat">
                        {user.weeklyPoints} pts • {formatKg(user.totalCo2Saved)} kg saved
                      </div>
                    </article>
                  ))}
                </div>

                {/* FULL TABLE */}
                <section className="leaderboard-table-wrapper">
                  <table className="leaderboard-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Participant</th>
                        <th>Total saved (kg CO₂)</th>
                        <th>Points</th>
                        <th>Streak (days)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedUsers.map((user, index) => (
                        <tr
                          key={user.userId ?? index}
                          className={user.isCurrentUser ? "row-current-user" : undefined}
                        >
                          <td>{user.rank ?? index + 1}</td>
                          <td>
                            <div className="user-cell">
                              <div className="avatar-circle avatar-circle--tiny">
                                <span>{getInitials(user.displayName)}</span>
                              </div>
                              <div>
                                <div className="user-name-row">
                                  <span className="user-name">{user.displayName}</span>
                                  {user.isCurrentUser && (
                                    <span className="small-label" style={{ marginLeft: 6 }}>
                                      You
                                    </span>
                                  )}
                                </div>
                                {user.email && (
                                  <div className="user-email">{user.email}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>{formatKg(user.totalCo2Saved)}</td>
                          <td>{user.weeklyPoints}</td>
                          <td>{user.streakDays}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              </>
            )}
        </section>

        {/* SIDEBAR: your stats */}
        <aside className="leaderboard-card leaderboard-sidebar-card">
          <h2>Your position</h2>
          {currentUser ? (
            <>
              <p className="section-subtitle">
                You're currently <strong>#{currentUser.rank}</strong>{" "}
                out of {participantsCount} participant
                {participantsCount === 1 ? "" : "s"}.
              </p>
              {typeof currentUser.percentile === "number" && (
                <p className="section-subtitle">
                  That puts you ahead of about{" "}
                  <strong>{Math.round((1 - currentUser.percentile) * 100)}%</strong>{" "}
                  of GreenLoop users.
                </p>
              )}

              <ul style={{ listStyle: "none", padding: 0, marginTop: "1rem" }}>
                <li>
                  <span className="small-label">Points ({viewLabel})</span>
                  <div>{currentUser.weeklyPoints}</div>
                </li>
                <li style={{ marginTop: "0.6rem" }}>
                  <span className="small-label">Current streak</span>
                  <div>{currentUser.streakDays} day(s)</div>
                </li>
                <li style={{ marginTop: "0.6rem" }}>
                  <span className="small-label">Total CO₂ saved</span>
                  <div>{formatKg(currentUser.totalCo2Saved)} kg</div>
                </li>
                {currentUser.level && (
                  <li style={{ marginTop: "0.6rem" }}>
                    <span className="small-label">Level</span>
                    <div>{currentUser.level}</div>
                  </li>
                )}
              </ul>
            </>
          ) : (
            <p className="section-subtitle">
              Complete your first activity to appear on the leaderboard and see how
              you rank against the community.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
