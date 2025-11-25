// src/pages/AchievementsPage.jsx
import React, { useMemo, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import AchievementCard from "../components/Achievements/AchievementCard";
import AddGoalModal from "../components/Achievements/AddGoalModal";
import useLocalStorage from "../hooks/useLocalStorage";

const DEFAULT_GOALS = [
    { id: "g1", title: "First Login", description: "Login at least once.", required: 1, icon: "trophy" },
    { id: "g2", title: "Weekly Streak: 3 days", description: "Use the app 3 days in a week.", required: 3, icon: "medal" },
    { id: "g3", title: "Achiever", description: "Complete 10 tasks", required: 10, icon: "star" },
];

export default function AchievementsPage() {
    // persisted goals & user progress
    const [goals, setGoals] = useLocalStorage("ach_goals", DEFAULT_GOALS);
    // user progress array of { goalId, progress, unlockedAt? }
    const [userProgress, setUserProgress] = useLocalStorage("ach_user_progress", []);

    const [showAdd, setShowAdd] = useState(false);

    const progressByGoal = useMemo(() => {
        const map = {};
        userProgress.forEach(p => { map[p.goalId] = p.progress; });
        return map;
    }, [userProgress]);

    const handleAddGoal = (goal) => {
        setGoals(prev => [goal, ...prev]);
    };

    const handleIncrement = (goalId, by = 1) => {
        setUserProgress(prev => {
            const exists = prev.find(p => p.goalId === goalId);
            if (exists) {
                return prev.map(p => p.goalId === goalId ? { ...p, progress: p.progress + by, unlockedAt: (p.progress + by) >= (goals.find(g => g.id === goalId)?.required || Infinity) ? new Date().toISOString() : p.unlockedAt } : p);
            } else {
                const unlockedAt = (by >= (goals.find(g => g.id === goalId)?.required || Infinity)) ? new Date().toISOString() : undefined;
                return [...prev, { goalId, progress: by, unlockedAt }];
            }
        });
    };

    const handleSetProgress = (goalId, value) => {
        setUserProgress(prev => prev.map(p => p.goalId === goalId ? { ...p, progress: value } : p));
    };

    const resetAll = () => {
        if (window.confirm("Reset all user progress?")) {
            setUserProgress([]);
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
                            onIncrement={(gid, by) => handleIncrement(gid, by)}
                            onSetProgress={(gid, val) => handleSetProgress(gid, val)}
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
