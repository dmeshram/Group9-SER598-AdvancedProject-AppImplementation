import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { emitActivity } from "../utils/activityBus";


const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function Home() {
  const { user, isAuthenticated, token } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalPoints: 0,
    weeklyPoints: 0,
    co2SavedKg: 0,
    currentStreak: 0,
    weeklyGoalDays: 5,
    weeklyActiveDays: 0,
  });

  const [recentActivities, setRecentActivities] = useState([]);

  const [activityType, setActivityType] = useState("WALKING");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("minutes");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [logging, setLogging] = useState(false);
  const [logError, setLogError] = useState("");
  const [logMessage, setLogMessage] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const fetchDashboard = async () => {
      try {
        const [statsRes, recentRes] = await Promise.all([
          fetch(`${API_BASE}/api/home/summary`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/api/activities/recent`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data);
        }

        if (recentRes.ok) {
          const data = await recentRes.json();
          setRecentActivities(data);
        }
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      }
    };

    fetchDashboard();
  }, [isAuthenticated, token]);

  const handleLogActivity = async (e) => {
    e.preventDefault();
    setLogError("");
    setLogMessage("");

    if (!amount || Number(amount) <= 0) {
      setLogError("Please enter a positive value for amount.");
      return;
    }

    setLogging(true);

    const mapActivity = (label, amount, date) => {
      const l = (label || "").toLowerCase();
      const isoDate = (date && date.slice(0, 10)) || new Date().toISOString().slice(0, 10);

      if (l.includes("walk")) return { type: "walking", value: Number(amount) || 1, date: isoDate };
      if (l.includes("cycle") || l.includes("bike")) return { type: "cycling", value: Number(amount) || 1, date: isoDate };
      if (l.includes("public")) return { type: "public_transport", value: Number(amount) || 1, date: isoDate };
      if (l.includes("reusable") || l.includes("bottle") || l.includes("bag")) return { type: "reusable", value: Number(amount) || 1, date: isoDate };
      if (l.includes("recycl")) return { type: "recycling", value: Number(amount) || 1, date: isoDate };

      return { type: "other", value: Number(amount) || 1, date: isoDate };
    };

    const busPayload = mapActivity(activityType, amount, date);

    try {
      emitActivity(busPayload);
    } catch (err) {
      console.warn("emitActivity failed:", err);
    }

    try {
      const res = await fetch(`${API_BASE}/api/activities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: activityType,
          amount: Number(amount),
          unit,
          date,
        }),
      });

      if (!res.ok) {
        setLogError("Failed to log activity. Please try again.");
      } else {
        const saved = await res.json();
        setLogMessage("Activity logged successfully!");
        setRecentActivities((prev) => [saved, ...prev].slice(0, 5));
        try {
          const statsRes = await fetch(`${API_BASE}/api/home/summary`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (statsRes.ok) {
            const newStats = await statsRes.json();
            setStats(newStats);
          }
        } catch (err) {
          console.error("Failed to refresh stats after logging activity:", err);
        }
      }
    } catch (err) {
      console.error("Error logging activity:", err);
      setLogError("Something went wrong. Please try again.");
    } finally {
      setLogging(false);
    }

    try {
      if (statsRes.ok) {
        const newStats = await statsRes.json();
        setStats(newStats);


        let eventType = null;
        let eventValue = Number(amount) || 1;

        if (activityType === "WALKING" || activityType === "RUNNING") {
          if (unit === "steps") {
            eventType = "steps";
          } else if (unit === "km") {
            eventType = "cycle_km"; // AchievementsPage maps cycle_km -> g7/g8
            // if it's walking distance you might want to map differently
          } else {
            eventType = "points"; // fallback (or define your own mapping)
          }
        } else if (activityType === "WORKOUT") {
          eventType = "workout";
          eventValue = 1; // count workouts
        } else if (activityType === "RECYCLING") {
          eventType = "recycle";
        } else if (activityType === "DRINK") {
          eventType = "drink_l";
        } else {
          // fallback: send generic points
          eventType = "points";
        }

        // finally emit
        emitActivity({ type: eventType, value: eventValue });
        // ===== END ADD BLOCK =====
      }
    } catch (err) {
      // existing error handling...
    }

  };

  const displayName = user?.name || user?.email || "GreenLooper";

  const weeklyGoalDays = stats.weeklyGoalDays || 5;
  const weeklyActiveDays = Math.min(
    stats.weeklyActiveDays ?? 0,
    weeklyGoalDays
  );
  const progressPct = Math.min(
    100,
    Math.round((weeklyActiveDays / weeklyGoalDays) * 100)
  );

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Welcome back, {displayName}</h1>
          <p className="dashboard-subtitle">
            Keep up your sustainable streak with today&apos;s green actions.
          </p>
        </div>
        <div className="dashboard-pill">
          <span className="pill-label">Current streak</span>
          <span className="pill-value">{stats.currentStreak} days</span>
        </div>
      </header>
      <div className="dashboard-grid">
        <section className="dashboard-main">
          <div className="stats-grid">
            <div className="stat-card">
              <p className="stat-label">Total Green Points</p>
              <p className="stat-value">{stats.totalPoints}</p>
              <p className="stat-footnote">All-time score</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">This Week</p>
              <p className="stat-value">{stats.weeklyPoints}</p>
              <p className="stat-footnote">Points earned</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">CO₂ Saved</p>
              <p className="stat-value">
                {stats.co2SavedKg.toFixed ? stats.co2SavedKg.toFixed(1) : stats.co2SavedKg} kg
              </p>
              <p className="stat-footnote">Estimated</p>
            </div>
          </div>
          <div className="panel">
            <div className="panel-header">
              <h2>Recent activities</h2>
            </div>
            {recentActivities.length === 0 ? (
              <p className="panel-empty">
                You haven&apos;t logged any activities yet today. Start with a short walk
              </p>
            ) : (
              <ul className="activity-list">
                {recentActivities.map((a) => (
                  <li key={a.id} className="activity-item">
                    <div>
                      <p className="activity-title">
                        {a.type} • {a.amount} {a.unit || "min"}
                      </p>
                      <p className="activity-meta">
                        {a.points} pts · {new Date(a.date || a.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="activity-badge">
                      +{a.points} pts
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
        <aside className="dashboard-side">
          <div className="panel">
            <h2>Log a green activity</h2>
            <p className="panel-description">
              Track your sustainable actions to grow your streak and points.
            </p>

            <form className="activity-form" onSubmit={handleLogActivity}>
              <label className="field">
                <span>Activity type</span>
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                >
                  <option value="WALKING">Walking instead of driving</option>
                  <option value="CYCLING">Cycling</option>
                  <option value="PUBLIC_TRANSPORT">Public transport</option>
                  <option value="REUSABLE_ITEMS">Reusable bottle/bag</option>
                  <option value="RECYCLING">Recycling</option>
                  <option value="OTHER">Other sustainable action</option>
                </select>
              </label>

              <div className="field-inline">
                <label className="field">
                  <span>Amount</span>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 20"
                    required
                  />
                </label>
                <label className="field">
                  <span>Unit</span>
                  <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                    <option value="minutes">minutes</option>
                    <option value="km">km</option>
                    <option value="actions">actions</option>
                  </select>
                </label>
              </div>

              <label className="field">
                <span>Date</span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </label>

              {logError && <p className="error-text">{logError}</p>}
              {logMessage && <p className="success-text">{logMessage}</p>}

              <button
                type="submit"
                className="primary-button"
                disabled={logging}
              >
                {logging ? "Logging..." : "Log activity"}
              </button>
            </form>
          </div>

          <div className="panel small">
            <h3>Weekly goal</h3>
            <p className="panel-description">
              Aim for at least{" "}
              <strong>{weeklyGoalDays} green days</strong> this week.
            </p>
            <div className="progress-wrapper">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="progress-label">
                {weeklyActiveDays} of {weeklyGoalDays} days completed
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}