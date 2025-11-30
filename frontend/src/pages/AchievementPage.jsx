// src/pages/AchievementsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import AchievementCard from "../components/Achievements/AchievementCard";
import AddGoalModal from "../components/Achievements/AddGoalModal";

const DEFAULT_GOALS = [
    { id: "g1", title: "First Login", description: "Login at least once.", required: 1, icon: "trophy" },
    { id: "g2", title: "Weekly Streak: 3 days", description: "Use the app 3 days in a week.", required: 3, icon: "medal" },
    { id: "g3", title: "Achiever", description: "Complete 10 tasks", required: 10, icon: "star" },
];

export default function AchievementsPage() {
    // persisted goals & user progress
    const [goals, setGoals] = useState([]);
    // user progress array of { goalId, progress, unlockedAt? }
    const [userProgress, setUserProgress] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAdd, setShowAdd] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        async function loadGoals() {
            try {
                setLoading(true);
                setError(null);

                const baseUrl = import.meta.env.VITE_API_BASE_URL;
                const res = await fetch(`${baseUrl}/api/goals`, {
                method: "GET",
                signal: controller.signal,
                });

                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                const data = await res.json();
                setGoals(data.goals ?? []);
                setUserProgress(data.progress ?? []);
            } catch (err) {
                if (err.name === "AbortError") return;
                console.error("Failed to load goals", err);
                setError("Could not load goals from server.");
            } finally {
                setLoading(false);
            }
        }

        loadGoals();
        return () => controller.abort();
    }, []);

    const progressByGoal = useMemo(() => {
        const map = {};
        userProgress.forEach(p => { map[p.goalId] = p.progress; });
        return map;
    }, [userProgress]);

    const upsertProgress = (updated) => {
        setUserProgress((prev) => {
        const others = prev.filter((p) => p.goalId !== updated.goalId);
        return [...others, updated];
        });
    };

    const handleAddGoal = async (goalInput) => {
        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL;
            const res = await fetch(`${baseUrl}/api/goals`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify(goalInput),
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const created = await res.json();
            setGoals((prev) => [created, ...prev]);
        } catch (err) {
            console.error("Failed to create goal", err);
            alert("Failed to create goal.");
        }
    };

    const handleIncrement = async (goalId, by = 1) => {
        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL;
            const res = await fetch(`${baseUrl}/api/goals/${goalId}/increment`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({ by }),
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const updated = await res.json();
            upsertProgress(updated);
        } catch (err) {
            console.error("Failed to increment goal", err);
            alert("Failed to update goal progress.");
        }
    };

    const handleSetProgress = async (goalId, value) => {
        try {
          const baseUrl = import.meta.env.VITE_API_BASE_URL;
          const res = await fetch(`${baseUrl}/api/goals/${goalId}/progress`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ progress: value }),
          });

          if (!res.ok) throw new Error(`HTTP ${res.status}`);

          const updated = await res.json();
          upsertProgress(updated);
        } catch (err) {
          console.error("Failed to set goal progress", err);
          alert("Failed to update goal progress.");
        }
    };

    const resetAll = async () => {
        try {
          const baseUrl = import.meta.env.VITE_API_BASE_URL;
          await Promise.all(
            goals.map((g) =>
              fetch(`${baseUrl}/api/goals/${g.id}/progress`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ progress: 0 }),
              })
            )
          );
          setUserProgress([]);
        } catch (err) {
          console.error("Failed to reset progress", err);
          alert("Failed to reset progress.");
        }
    };

    return (
        <Container className="achievements-page">
            <header className="achievements-header">
                <div>
                    <h1 className="page-title">Achievements</h1>
                    <p className="section-subtitle">
                        Track your sustainability milestones and goals.
                    </p>
                </div>
                <div className="achievements-actions">
                    <Button variant="outline-primary" onClick={() => setShowAdd(true)}>
                        Add Goal
                    </Button>
                    <Button variant="outline-danger" onClick={resetAll}>
                        Reset Progress
                    </Button>
                </div>
            </header>

            <Row xs={1} md={2} lg={3} className="g-3">
                {goals.map((goal) => (
                    <Col key={goal.id}>
                        <AchievementCard
                            goal={goal}
                            progress={progressByGoal[goal.id] || 0}
                            onIncrement={(by) => handleIncrement(goal.id, by)}
                            onSetProgress={(val) => handleSetProgress(goal.id, val)}
                        />
                    </Col>
                ))}
            </Row>

            <AddGoalModal
                show={showAdd}
                onClose={() => setShowAdd(false)}
                onAdd={handleAddGoal}
            />
        </Container>
    );

}
