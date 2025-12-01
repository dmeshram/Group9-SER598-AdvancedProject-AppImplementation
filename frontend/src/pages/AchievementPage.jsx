import React, { useEffect, useMemo, useState } from "react";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import ProgressBar from "react-bootstrap/ProgressBar";
import Badge from "react-bootstrap/Badge";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";

import useLocalStorage from "../hooks/useLocalStorage";
import { onActivity } from "../utils/activityBus";
import "../App.css";

const PRESET_GOALS = [
    { id: "w1", title: "First Walk Instead of Driving", description: "Log your first walking action instead of driving.", required: 1, unit: "actions", activityType: "walking", icon: "🥇" },
    { id: "w2", title: "5 Walks Instead of Driving", description: "Choose walking instead of driving 5 times.", required: 5, unit: "actions", activityType: "walking", icon: "🚶" },
    { id: "w3", title: "10,000 Steps", description: "Accumulate 10,000 steps total.", required: 10000, unit: "steps", activityType: "walking", icon: "🏃" },

    { id: "c1", title: "First Cycle", description: "Log your first cycling activity.", required: 1, unit: "actions", activityType: "cycling", icon: "🚴" },
    { id: "c2", title: "Cycle 50 km", description: "Cycle a total of 50 km.", required: 50, unit: "km", activityType: "cycling", icon: "🚴‍♂️" },

    { id: "pt1", title: "First Public Transport Ride", description: "Use public transport instead of driving once.", required: 1, unit: "actions", activityType: "public_transport", icon: "🚌" },
    { id: "pt2", title: "20 Public Transport Trips", description: "Use public transport 20 times.", required: 20, unit: "actions", activityType: "public_transport", icon: "🚆" },

    { id: "rb1", title: "Reusable Bottle/Bag — 10 Uses", description: "Use a reusable bottle or bag 10 times.", required: 10, unit: "actions", activityType: "reusable", icon: "♻️" },

    { id: "r1", title: "Recycle 5 Items", description: "Recycle 5 items.", required: 5, unit: "items", activityType: "recycling", icon: "🗑️" },
    { id: "r2", title: "Recycle 50 Items", description: "Recycle 50 items.", required: 50, unit: "items", activityType: "recycling", icon: "🏆" },

    { id: "o1", title: "25 Other Sustainable Actions", description: "Log 25 'Other sustainable action' entries.", required: 25, unit: "actions", activityType: "other", icon: "🌱" },

    { id: "s1", title: "7-Day Green Streak", description: "Be active 7 days in a row (any dropdown action).", required: 7, unit: "days", activityType: "streak", icon: "🔥" }
];


function percentOf(curr, req) {
    if (!req || req === 0) return 100;
    const p = Math.round((curr / req) * 100);
    return Math.max(0, Math.min(100, p));
}

function todayDateISO() {
    return new Date().toISOString().slice(0, 10);
}
function addDaysISO(isoDate, days) {
    const d = new Date(isoDate + "T00:00:00");
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
}
function diffDaysISO(aIso, bIso) {
    const a = new Date(aIso + "T00:00:00");
    const b = new Date(bIso + "T00:00:00");
    const ms = a - b;
    return Math.round(ms / (24 * 60 * 60 * 1000));
}


export default function AchievementPage() {

    const [goals, setGoals] = useLocalStorage("ach_goals_v2", PRESET_GOALS);

    const [progressMap, setProgressMap] = useLocalStorage("ach_progress_v2", {});

    const [streakState, setStreakState] = useLocalStorage("ach_streak_v2", { lastDate: null, current: 0 });

    useEffect(() => {
        const unsub = onActivity((activity) => {
            handleActivityEvent(activity);
        });
        return unsub;

    }, [goals, progressMap, streakState]);

    useEffect(() => {
        setGoals(prev => {
            const byId = {};
            (prev || []).forEach(g => byId[g.id] = g);
            PRESET_GOALS.forEach(pg => {
                if (!byId[pg.id]) byId[pg.id] = pg;
            });
            return Object.values(byId);
        });
    }, []);

    function handleActivityEvent(activity) {
        if (!activity || !activity.type) return;

        const date = activity.date || todayDateISO();

        updateStreak(date);

        const updates = { ...progressMap };

        const inc = (goalId, by = 1) => {
            const cur = (updates[goalId]?.progress) || 0;
            const unlocked = updates[goalId]?.unlockedAt;
            const newProgress = cur + by;
            updates[goalId] = { progress: newProgress, unlockedAt: unlocked || (newProgress >= getGoalReq(goalId) ? new Date().toISOString() : null) };
        };

        function getGoalReq(goalId) {
            const g = goals.find(x => x.id === goalId);
            return g ? g.required : Infinity;
        }

        // Handle each activity type
        switch (activity.type) {
            case "walking": {
                // if value provided and looks like steps use that, otherwise count as action
                const val = Number(activity.value) || 1;
                // add to steps-based goal (w3) and action-based goals (w1,w2)
                const stepsGoal = goals.find(g => g.id === "w3");
                if (stepsGoal && stepsGoal.required > 1) {
                    // if activity.value is big (likely steps) add that value, else if val===1 treat as action and no steps increase
                    if (Number(activity.value) && Number(activity.value) > 1) inc("w3", Number(activity.value));
                }
                // increment action goals
                inc("w1", 1);
                inc("w2", 1);
                break;
            }

            case "cycling": {
                // activity.value expected in km (number)
                const km = Number(activity.value) || 1;
                inc("c1", 1);
                inc("c2", km);
                break;
            }

            case "public_transport":
            case "public-transport":
            case "publictransport": {
                inc("pt1", 1);
                inc("pt2", 1);
                break;
            }

            case "reusable": {
                inc("rb1", 1);
                break;
            }

            case "recycling": {
                const items = Number(activity.value) || 1;
                inc("r1", items);
                inc("r2", items);
                break;
            }

            case "other": {
                inc("o1", Number(activity.value) || 1);
                break;
            }

            default: {
                if (goals.find(g => g.id === "o1")) inc("o1", Number(activity.value) || 1);
                break;
            }
        }

        setProgressMap(updates);
    }

    function updateStreak(newDateISO) {
        const last = streakState.lastDate;
        if (!last) {
            const nextState = { lastDate: newDateISO, current: 1 };
            setStreakState(nextState);
            ensureStreakProgress(nextState.current);
            return;
        }

        if (last === newDateISO) {
            return;
        }

        const diff = diffDaysISO(newDateISO, last);
        if (diff === 1) {
            const next = streakState.current + 1;
            const nextState = { lastDate: newDateISO, current: next };
            setStreakState(nextState);
            ensureStreakProgress(next);
        } else if (diff <= 0) {
        } else {
            const nextState = { lastDate: newDateISO, current: 1 };
            setStreakState(nextState);
            ensureStreakProgress(1);
        }
    }

    function ensureStreakProgress(currentDays) {
        const updates = { ...progressMap };
        const goalId = "s1";
        const goalReq = (goals.find(g => g.id === goalId)?.required) || 7;
        updates[goalId] = {
            progress: currentDays,
            unlockedAt: (currentDays >= goalReq) ? (updates[goalId]?.unlockedAt || new Date().toISOString()) : updates[goalId]?.unlockedAt || null
        };
        setProgressMap(updates);
    }

    function getGoalProgress(id) {
        return (progressMap[id]?.progress) || 0;
    }
    function isUnlocked(id) {
        const p = progressMap[id];
        const g = goals.find(x => x.id === id);
        return !!(p && g && p.progress >= g.required);
    }

    function incrementGoalManual(id, by = 1) {
        const updates = { ...progressMap };
        const cur = (updates[id]?.progress) || 0;
        const newProgress = cur + by;
        updates[id] = { progress: newProgress, unlockedAt: updates[id]?.unlockedAt || (newProgress >= (goals.find(g => g.id === id)?.required || Infinity) ? new Date().toISOString() : null) };
        setProgressMap(updates);
        if (id === "s1") {
            setStreakState(prev => ({ lastDate: prev.lastDate || todayDateISO(), current: newProgress }));
        }
    }

    function resetGoal(id) {
        const updates = { ...progressMap };
        delete updates[id];
        setProgressMap(updates);
        if (id === "s1") {
            setStreakState({ lastDate: null, current: 0 });
        }
    }


    const [showAdd, setShowAdd] = useState(false);
    const [newGoal, setNewGoal] = useState({ title: "", description: "", required: 1, unit: "actions", icon: "⭐" });

    function addGoal() {
        if (!newGoal.title) return;
        setGoals(prev => [{ id: `custom_${Date.now()}`, ...newGoal }, ...(prev || [])]);
        setNewGoal({ title: "", description: "", required: 1, unit: "actions", icon: "⭐" });
        setShowAdd(false);
    }

    const goalsSorted = useMemo(() => {
        // show preset goals first in defined order, then customs
        const presetIds = PRESET_GOALS.map(g => g.id);
        const preset = goals.filter(g => presetIds.includes(g.id)).sort((a, b) => presetIds.indexOf(a.id) - presetIds.indexOf(b.id));
        const custom = goals.filter(g => !presetIds.includes(g.id));
        return [...preset, ...custom];
    }, [goals]);

    return (
        <Container className="achievements-page">
            <div className="achievements-header">
                <div>
                    <h2 className="page-title">Achievements</h2>
                    <div className="section-subtitle">Track your green milestones and unlocked badges</div>
                </div>
                <div className="achievements-actions">
                    <Button variant="outline-primary" className="ach-btn ach-btn-outline" onClick={() => setShowAdd(true)}>Add Goal</Button>
                    <Button variant="outline-danger" className="ach-btn" onClick={() => { if (confirm("Reset all achievement progress?")) { setProgressMap({}); setStreakState({ lastDate: null, current: 0 }); } }}>Reset Progress</Button>
                </div>
            </div>

            <div className="achievements-grid">
                {goalsSorted.map(goal => {
                    const curr = getGoalProgress(goal.id);
                    const req = goal.required || 1;
                    const unlocked = curr >= req;
                    const pct = percentOf(curr, req);

                    return (
                        <div key={goal.id} className="achievement-card">
                            <div className="achievement-header">
                                <div className={`achievement-icon ${unlocked ? "unlocked" : "locked"}`}>{goal.icon}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <div className="achievement-title">{goal.title}</div>
                                        {unlocked && <Badge bg="success" style={{ marginLeft: 8 }}>Unlocked</Badge>}
                                    </div>
                                    {goal.description && <div className="achievement-desc">{goal.description}</div>}
                                </div>
                            </div>

                            <div className="achievement-progress">
                                {/* use bootstrap ProgressBar for consistency */}
                                <ProgressBar now={pct} label={`${curr}/${req}`} />
                                <div className="progress-label" style={{ marginTop: 8 }}>
                                    {goal.unit ? `${curr} / ${req} ${goal.unit}` : `${curr} / ${req}`}
                                </div>
                            </div>

                            <div className="achievement-actions">
                                {!unlocked ? (
                                    <>
                                        <Button size="sm" variant="outline-secondary" className="ach-btn ach-btn-outline" onClick={() => incrementGoalManual(goal.id, 1)}>+1</Button>
                                        <Button size="sm" variant="outline-secondary" className="ach-btn ach-btn-outline" onClick={() => { const by = Number(prompt("Enter amount to add:", "1")) || 0; if (by > 0) incrementGoalManual(goal.id, by); }}>+custom</Button>
                                        <Button size="sm" variant="outline-secondary" className="ach-btn ach-btn-outline" onClick={() => resetGoal(goal.id)}>Reset</Button>
                                    </>
                                ) : (
                                    <Button size="sm" variant="success" className="ach-btn ach-btn-success" disabled>🎉 Completed</Button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <Modal show={showAdd} onHide={() => setShowAdd(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Goal</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-2">
                        <Form.Label>Title</Form.Label>
                        <Form.Control value={newGoal.title} onChange={e => setNewGoal(g => ({ ...g, title: e.target.value }))} />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>Description</Form.Label>
                        <Form.Control value={newGoal.description} onChange={e => setNewGoal(g => ({ ...g, description: e.target.value }))} />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>Required</Form.Label>
                        <Form.Control type="number" min="1" value={newGoal.required} onChange={e => setNewGoal(g => ({ ...g, required: Number(e.target.value) }))} />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>Unit</Form.Label>
                        <Form.Control value={newGoal.unit} onChange={e => setNewGoal(g => ({ ...g, unit: e.target.value }))} />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
                    <Button variant="primary" onClick={addGoal}>Add goal</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}
