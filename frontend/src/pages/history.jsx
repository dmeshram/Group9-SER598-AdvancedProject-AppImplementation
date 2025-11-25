import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Line } from "react-chartjs-2";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

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

// === MOCK DATA ===
const MOCK_HISTORY = {
  achievements: [
    { id: 1, title: "Walked 10,000 steps", date: "2025-01-12" },
    { id: 2, title: "Reached 7-day streak", date: "2025-01-05" },
    { id: 3, title: "Saved 5kg CO₂ in a week", date: "2024-12-19" },
  ],
  completedActivities: [
    { date: "2025-01-12", activity: "Used reusable bottle", co2Saved: 0.2 },
    { date: "2025-01-12", activity: "Walked instead of driving", co2Saved: 1.1 },
    { date: "2025-01-11", activity: "Public transport", co2Saved: 0.8 },
  ],
  co2Trend: [
    { day: "Mon", kg: 1.2 },
    { day: "Tue", kg: 2.4 },
    { day: "Wed", kg: 1.8 },
    { day: "Thu", kg: 2.1 },
    { day: "Fri", kg: 1.1 },
    { day: "Sat", kg: 1.4 },
    { day: "Sun", kg: 1.9 },
  ],
  streakDays: 21,
  calendar: [
    { date: "2025-01-01", completed: true },
    { date: "2025-01-02", completed: true },
    { date: "2025-01-03", completed: false },
    { date: "2025-01-04", completed: true },
    { date: "2025-01-05", completed: true },
    { date: "2025-01-06", completed: false },
    { date: "2025-01-07", completed: true },
  ],
};

// === HELPER ===
function markedDatesArray(calendarData) {
  return calendarData
    .filter((d) => d.completed)
    .map((d) => new Date(d.date).toDateString());
}

// === MAIN COMPONENT ===
function History() {
  const { userId } = useParams();
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHistory(MOCK_HISTORY);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [userId]);

  const totalCo2Saved = useMemo(() => {
    if (!history) return 0;
    return history.co2Trend.reduce((sum, d) => sum + d.kg, 0);
  }, [history]);

  // === LINE CHART DATA ===
  const lineChartData = useMemo(() => {
    if (!history) return null;

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

  // === LINE CHART OPTIONS ===
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

      <section className="leaderboard-layout">
        {/* LEFT MAIN CONTENT */}
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
              {history.achievements.map((a) => (
                <tr key={a.id}>
                  <td>{a.title}</td>
                  <td>{a.date}</td>
                </tr>
              ))}
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
              {history.completedActivities.map((act, idx) => (
                <tr key={idx}>
                  <td>{act.date}</td>
                  <td>{act.activity}</td>
                  <td>{act.co2Saved.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="leaderboard-card leaderboard-sidebar-card">
          <h2>Your Insights</h2>

          {/* Total CO2 */}
          <div className="summary-block">
            <div className="summary-label">Total CO₂ Saved (this period)</div>
            <div className="summary-value">{totalCo2Saved.toFixed(1)} kg</div>
          </div>

          {/* LINE CHART */}
          <div className="summary-block">
            <div className="summary-label">Weekly CO₂ Saved</div>
            <div className="graph-card custom-line-chart">
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          </div>

          {/* CALENDAR */}
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
