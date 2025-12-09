import { useEffect, useState, useMemo } from "react";
import { Line } from "react-chartjs-2";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useAuth } from "../auth/AuthContext.jsx";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function markedDatesArray(calendarData) {
  return (calendarData || [])
    .filter((d) => d.completed)
    .map((d) => new Date(d.date).toDateString());
}

function History() {
  const { token, isAuthenticated } = useAuth();

  const [history, setHistory] = useState({
    achievements: [],
    completedActivities: [],
    co2Trend: [],
    streakDays: 0,
    calendar: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const fetchHistory = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/api/history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to load history (${res.status})`);
        }

        const data = await res.json();
        setHistory({
          achievements: data.achievements || [],
          completedActivities: data.completedActivities || [],
          co2Trend: data.co2Trend || [],
          streakDays: data.streakDays ?? 0,
          calendar: data.calendar || [],
        });
      } catch (e) {
        console.error("Error fetching history:", e);
        setError("Could not load your history. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [isAuthenticated, token]);

  const totalCo2Saved = useMemo(() => {
    if (!history || !history.co2Trend) return 0;
    return history.co2Trend.reduce((sum, d) => sum + (d.kg || 0), 0);
  }, [history]);

  const lineChartData = useMemo(() => {
    if (!history || !history.co2Trend || history.co2Trend.length === 0)
      return {
        labels: [],
        datasets: [],
      };

    return {
      labels: history.co2Trend.map((d) => d.day),
      datasets: [
        {
          label: "CO₂ saved (kg)",
          data: history.co2Trend.map((d) => d.kg),
          tension: 0.4,
          borderColor: "#4CAF50",
          backgroundColor: "rgba(76, 175, 80, 0.15)",
          pointBackgroundColor: "#4CAF50",
          pointBorderColor: "#4CAF50",
          pointRadius: 5,
          pointHoverRadius: 7,
          borderWidth: 3,
        },
      ],
    };
  }, [history]);

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#333",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: 10,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#444", font: { weight: "600" } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0,0,0,0.05)" },
        ticks: { color: "#444", font: { weight: "600" } },
      },
    },
  };

  if (loading) return <div>Loading history...</div>;

  return (
    <div className="leaderboard-page">
      <header className="leaderboard-header">
        <h1 className="page-title">Your History</h1>
        <p className="section-subtitle">
          A complete overview of your eco-friendly journey and achievements.
        </p>
      </header>

      {error && (
        <div style={{ color: "#fecaca", marginBottom: "1rem" }}>{error}</div>
      )}

      <section className="leaderboard-layout">
        <div className="leaderboard-card leaderboard-main-card">
          <h2>Your Streak</h2>
          <div className="summary-card" style={{ marginBottom: "2rem" }}>
            <div className="summary-label">Current streak</div>
            <div className="summary-value">{history.streakDays} days</div>
          </div>

          <h2>Past Achievements</h2>
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Achievement</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {history.achievements.length === 0 ? (
                <tr>
                  <td colSpan={2}>No achievements logged yet.</td>
                </tr>
              ) : (
                history.achievements.map((a) => (
                  <tr key={a.id}>
                    <td>{a.title}</td>
                    <td>{a.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <h2 style={{ marginTop: "2rem" }}>Completed Activities</h2>
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Activity</th>
                <th>CO₂ Saved (kg)</th>
              </tr>
            </thead>
            <tbody>
              {history.completedActivities.length === 0 ? (
                <tr>
                  <td colSpan={3}>No activities logged yet.</td>
                </tr>
              ) : (
                history.completedActivities.map((act, idx) => (
                  <tr key={idx}>
                    <td>{act.date}</td>
                    <td>{act.activity}</td>
                    <td>{(act.co2Saved || 0).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <aside className="leaderboard-card leaderboard-sidebar-card">
          <h2>Your Insights</h2>

          <div className="summary-block">
            <div className="summary-label">Total CO₂ Saved (this period)</div>
            <div className="summary-value">{totalCo2Saved.toFixed(1)} kg</div>
          </div>

          <div className="summary-block">
            <div className="summary-label">Weekly CO₂ Saved</div>
            <div className="graph-card custom-line-chart">
              {history.co2Trend.length > 0 ? (
                <Line data={lineChartData} options={lineChartOptions} />
              ) : (
                <div style={{ fontSize: 13, color: "#9ca3af" }}>
                  Not enough data yet to show a trend.
                </div>
              )}
            </div>
          </div>

          {/* Calendar */}
          <div className="summary-block">
            <div className="summary-label">Activity Calendar</div>
            <Calendar
              tileClassName={({ date }) => {
                const formatted = date.toDateString();
                const completedDays = markedDatesArray(history.calendar);
                return completedDays.includes(formatted)
                  ? "calendar-tile-done"
                  : null;
              }}
            />
          </div>
        </aside>
      </section>
    </div>
  );
}

export default History;