import { useEffect, useMemo, useState } from "react";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import ProgressBar from "react-bootstrap/ProgressBar";
import Badge from "react-bootstrap/Badge";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";

import { useAuth } from "../auth/AuthContext.jsx";
import "../App.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const PRESET_GOALS = [
  {
    id: "w1",
    title: "First Walk Instead Of Driving",
    description: "Log your first walking action instead of driving.",
    required: 1,
    unit: "actions",
    activityType: "WALKING",
    icon: "🚶",
  },
  {
    id: "w2",
    title: "5 Walks Instead Of Driving",
    description: "Choose walking instead of driving 5 times.",
    required: 5,
    unit: "actions",
    activityType: "WALKING",
    icon: "🥾",
  },
  {
    id: "w3",
    title: "10,000 Steps",
    description: "Accumulate 10,000 steps total.",
    required: 10000,
    unit: "steps",
    activityType: "WALKING",
    icon: "🏃",
  },
  {
    id: "c1",
    title: "First Cycle",
    description: "Log your first cycling activity.",
    required: 1,
    unit: "actions",
    activityType: "CYCLING",
    icon: "🚴",
  },
  {
    id: "c2",
    title: "Cycle 50 km",
    description: "Cycle a total of 50 km.",
    required: 50,
    unit: "km",
    activityType: "CYCLING",
    icon: "🚴‍♂️",
  },
  {
    id: "pt1",
    title: "First Public Transport Ride",
    description: "Use public transport instead of driving once.",
    required: 1,
    unit: "actions",
    activityType: "PUBLIC_TRANSPORT",
    icon: "🚌",
  },
  {
    id: "pt2",
    title: "20 Public Transport Trips",
    description: "Use public transport 20 times.",
    required: 20,
    unit: "actions",
    activityType: "PUBLIC_TRANSPORT",
    icon: "🚆",
  },
  {
    id: "rb1",
    title: "Reusable Bottle/Bag — 10 Uses",
    description: "Use a reusable bottle or bag 10 times.",
    required: 10,
    unit: "actions",
    activityType: "REUSABLE_ITEMS",
    icon: "♻️",
  },
  {
    id: "r1",
    title: "Recycle 5 Items",
    description: "Recycle 5 items.",
    required: 5,
    unit: "items",
    activityType: "RECYCLING",
    icon: "🗑️",
  },
  {
    id: "r2",
    title: "Recycle 50 Items",
    description: "Recycle 50 items.",
    required: 50,
    unit: "items",
    activityType: "RECYCLING",
    icon: "🏆",
  },
  {
    id: "o1",
    title: "25 Other Sustainable Actions",
    description: "Log 25 'Other sustainable action' entries.",
    required: 25,
    unit: "actions",
    activityType: "OTHER",
    icon: "🌱",
  },
  {
    id: "s1",
    title: "7-Day Green Streak",
    description: "Be active 7 days in a row (any dropdown action).",
    required: 7,
    unit: "days",
    activityType: "STREAK",
    icon: "🔥",
  },
];

function percentOf(curr, req) {
  if (!req || req === 0) return 100;
  const p = Math.round((curr / req) * 100);
  return Math.max(0, Math.min(100, p));
}

export default function AchievementPage() {
  const { token, isAuthenticated } = useAuth();
  const [goals, setGoals] = useState(PRESET_GOALS);
  const [progressMap, setProgressMap] = useState({});

  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setLoading(false);
      return;
    }

    let mounted = true;

    async function load() {
      setLoading(true);
      setServerError(null);

      try {
        const masterRes = await fetch(`${API_BASE}/api/achievements/master`, {
          headers: { "Content-Type": "application/json" },
        });

        if (masterRes.ok) {
          const masterJson = await masterRes.json();
          if (mounted && Array.isArray(masterJson) && masterJson.length > 0) {
            const byId = {};
            PRESET_GOALS.forEach((g) => {
              byId[g.id] = g;
            });
            masterJson.forEach((g) => {
              byId[g.id] = { ...byId[g.id], ...g };
            });
            setGoals(Object.values(byId));
          }
        } else {
          console.warn("Failed to load /api/achievements/master, using presets.");
        }
        const progressRes = await fetch(`${API_BASE}/api/achievements`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!progressRes.ok) {
          const txt = await progressRes.text();
          try {
            const jsonErr = JSON.parse(txt);
            throw new Error(jsonErr.message || JSON.stringify(jsonErr));
          } catch {
            throw new Error(txt || `HTTP ${progressRes.status}`);
          }
        }

        const arr = await progressRes.json();
        const newMap = {};
        (arr || []).forEach((row) => {
          newMap[row.id] = {
            progress: Number(row.progress || 0),
            unlockedAt: row.unlockedAt || null,
          };
        });

        if (mounted) {
          setProgressMap(newMap);
        }
      } catch (err) {
        console.error("Failed to load achievements:", err);
        if (mounted) setServerError(String(err.message || err));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, token]);
  function getGoalProgress(id) {
    return progressMap[id]?.progress || 0;
  }

  const goalsSorted = useMemo(() => {
    const presetIds = PRESET_GOALS.map((g) => g.id);
    const preset = goals
      .filter((g) => presetIds.includes(g.id))
      .sort((a, b) => presetIds.indexOf(a.id) - presetIds.indexOf(b.id));
    const custom = goals.filter((g) => !presetIds.includes(g.id));
    return [...preset, ...custom];
  }, [goals]);

  return (
    <Container className="achievements-page">
      <div className="achievements-header">
        <div>
          <h2 className="page-title">Achievements</h2>
          <div className="section-subtitle">
            Track your green milestones and unlocked badges
          </div>
        </div>
      </div>

      {!isAuthenticated && (
        <div style={{ marginBottom: 12, color: "#fecaca" }}>
          Please log in to see your achievements.
        </div>
      )}

      {loading && (
        <div style={{ marginBottom: 12 }}>Loading achievements…</div>
      )}

      {serverError && (
        <div style={{ marginBottom: 12, color: "#fecaca" }}>
          Server: {serverError}
        </div>
      )}

      <Row>
        {goalsSorted.map((goal) => {
          const curr = getGoalProgress(goal.id);
          const req = goal.required || 1;
          const unlocked = curr >= req;
          const pct = percentOf(curr, req);

          return (
            <Col md={4} key={goal.id} className="mb-3">
              <Card className="achievements-card">
                <Card.Body>
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ fontSize: 28 }}>{goal.icon || "🌱"}</div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div style={{ fontWeight: 600 }}>{goal.title}</div>
                        {unlocked && <Badge bg="success">Unlocked</Badge>}
                      </div>
                      {goal.description && (
                        <div
                          className="text-muted"
                          style={{ fontSize: 13, marginTop: 2 }}
                        >
                          {goal.description}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <ProgressBar now={pct} label={`${curr}/${req}`} />
                    <div
                      className="progress-label"
                      style={{ marginTop: 8, fontSize: 13 }}
                    >
                      {goal.unit
                        ? `${curr} / ${req} ${goal.unit}`
                        : `${curr} / ${req}`}
                    </div>
                  </div>

                  {goal.activityType && (
                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 12,
                        color: "var(--muted-text, #9ca3af)",
                      }}
                    >
                      Type:{" "}
                      <span style={{ textTransform: "capitalize" }}>
                        {goal.activityType.toLowerCase().replace("_", " ")}
                      </span>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
}