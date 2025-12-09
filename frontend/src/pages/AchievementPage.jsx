
import { useEffect, useMemo, useState } from "react";
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
import { useAuth } from "../auth/AuthContext";
import "../App.css";

const API_BASE = import.meta.env.VITE_API_BASE || "";

const PRESET_GOALS = [
    { id: "w1", title: "First Walk Instead Of Driving", description: "Log your first walking action instead of driving.", required: 1, unit: "actions", activityType: "walking", icon: "🚶" },
    { id: "w2", title: "5 Walks Instead Of Driving", description: "Choose walking instead of driving 5 times.", required: 5, unit: "actions", activityType: "walking", icon: "🥾" },
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

function readTokenFromStorage() {
    return (
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken") ||
        null
    );
}

export default function AchievementPage() {
    const { token, isAuthenticated } = useAuth();
    const [goals, setGoals] = useLocalStorage("ach_goals_v2", PRESET_GOALS);
    const [progressMap, setProgressMap] = useLocalStorage("ach_progress_v2", {});
    const [loading, setLoading] = useState(true);
    const [serverError, setServerError] = useState(null);
    const [showAdd, setShowAdd] = useState(false);
    const [newGoal, setNewGoal] = useState({ title: "", description: "", required: 1, unit: "actions", icon: "⭐" });

    useEffect(() => {
        setGoals(prev => {
            const byId = {};
            (prev || []).forEach(g => (byId[g.id] = g));
            PRESET_GOALS.forEach(pg => {
                if (!byId[pg.id]) byId[pg.id] = pg;
            });
            return Object.values(byId);
        });
        
    }, []);

   
    useEffect(() => {
        let mounted = true;
        async function load() {
            setLoading(true);
            setServerError(null);
            try {
              
                const masterRes = await fetch(`${API_BASE}/api/achievements/master`);
                const masterText = await masterRes.text();
                try {
                    const masterJson = masterText ? JSON.parse(masterText) : [];
                    setGoals(prev => {
                        const byId = {};
                        (prev || []).forEach(g => (byId[g.id] = g));
                        (masterJson || []).forEach(m => (byId[m.id] = { ...m }));
                        
                        PRESET_GOALS.forEach(pg => {
                            if (!byId[pg.id]) byId[pg.id] = pg;
                        });
                        return Object.values(byId);
                    });
                } catch (e) {
                    console.warn("Could not parse /api/achievements/master response as JSON. Using local presets.");
                }

                const token = readTokenFromStorage();
                if (token) {
                    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
                    const res = await fetch(`${API_BASE}/api/achievements`, { headers });
                    const txt = await res.text();
                    if (!res.ok) {
                        
                        try {
                            const jsonErr = JSON.parse(txt);
                            throw new Error(jsonErr.message || JSON.stringify(jsonErr));
                        } catch (parseErr) {
                            throw new Error(txt || `HTTP ${res.status}`);
                        }
                    }
                    const arr = txt ? JSON.parse(txt) : [];
                    const newMap = { ...progressMap }; 
                    (arr || []).forEach(row => {
                        newMap[row.id] = {
                            progress: Number(row.progress || 0),
                            unlockedAt: row.unlockedAt || null
                        };
                    });
                    if (mounted) setProgressMap(newMap);
                } else {
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
    }, []); 

    useEffect(() => {
        const unsub = onActivity((activity) => {
            if (!activity || !activity.type) return;
            // optimistic local update
            const updates = { ...progressMap };

            const inc = (goalId, by = 1) => {
                const cur = (updates[goalId]?.progress) || 0;
                const unlockedAt = updates[goalId]?.unlockedAt;
                const newProgress = cur + by;
                const goalReq = (goals.find(g => g.id === goalId)?.required) || Infinity;
                updates[goalId] = {
                    progress: newProgress,
                    unlockedAt: unlockedAt || (newProgress >= goalReq ? new Date().toISOString() : null)
                };
            };

            switch (activity.type) {
                case "walking": {
                    const val = Number(activity.value) || 1;
                    if (val > 1) inc("w3", val); 
                    inc("w1", 1);
                    inc("w2", 1);
                    break;
                }
                case "cycling": {
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
                    // fallback: add to other goal
                    inc("o1", Number(activity.value) || 1);
                    break;
                }
            }
            const date = activity.date || todayDateISO();
            const streakGoalId = "s1";
            if (!updates[streakGoalId]) updates[streakGoalId] = { progress: 1, unlockedAt: null };
            const lastProgress = (progressMap[streakGoalId]?.progress) || 0;
            if (activity.date && activity.date !== todayDateISO()) {
            } else {
                if (lastProgress === 0 || (updates[streakGoalId].progress === lastProgress)) {
                    updates[streakGoalId] = { progress: lastProgress + 1, unlockedAt: (lastProgress + 1 >= (goals.find(g => g.id === streakGoalId)?.required || 7) ? new Date().toISOString() : null) };
                }
            }

            setProgressMap(updates);
            refreshProgressFromServer().catch(err => console.debug("background refresh failed:", err));
        });

        return () => unsub && typeof unsub === "function" && unsub();
    }, [goals, progressMap]);

    async function refreshProgressFromServer() {
        const token = readTokenFromStorage();
        if (!token) return;
        const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
        const res = await fetch("/api/achievements", { headers });
        if (!res.ok) throw new Error(`Server ${res.status}`);
        const txt = await res.text();
        const arr = txt ? JSON.parse(txt) : [];
        const newMap = {};
        (arr || []).forEach(row => {
            newMap[row.id] = { progress: Number(row.progress || 0), unlockedAt: row.unlockedAt || null };
        });
        setProgressMap(prev => ({ ...prev, ...newMap }));
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
        const goalReq = (goals.find(g => g.id === id)?.required) || Infinity;
        updates[id] = { progress: newProgress, unlockedAt: updates[id]?.unlockedAt || (newProgress >= goalReq ? new Date().toISOString() : null) };
        setProgressMap(updates);
    }

    function resetGoal(id) {
        const updates = { ...progressMap };
        delete updates[id];
        setProgressMap(updates);
    }

    function addGoal() {
        if (!newGoal.title) return;
        setGoals(prev => [{ id: `custom_${Date.now()}`, ...newGoal }, ...(prev || [])]);
        setNewGoal({ title: "", description: "", required: 1, unit: "actions", icon: "⭐" });
        setShowAdd(false);
    }

    const goalsSorted = useMemo(() => {
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
                    <Button variant="outline-primary" onClick={() => setShowAdd(true)}>Add Goal</Button>{' '}
                    <Button variant="outline-danger" onClick={() => { if (confirm("Reset all achievement progress?")) { setProgressMap({}); } }}>Reset Progress</Button>
                </div>
            </div>

            {loading && <div style={{ marginBottom: 12 }}>Loading achievements…</div>}
            {serverError && <div style={{ marginBottom: 12, color: "#fecaca" }}>Server: {serverError}</div>}

            {/* Grid using Bootstrap row/cols: 3 cards per row on md+ */}
            <Row>
                {goalsSorted.map(goal => {
                    const curr = getGoalProgress(goal.id);
                    const req = goal.required || 1;
                    const unlocked = curr >= req;
                    const pct = percentOf(curr, req);

                    return (
                        <Col md={4} key={goal.id} className="mb-3">
                            <Card className="achievements-card">
                                <Card.Body>
                                    <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
                                        <div style={{ fontSize: 28 }}>{goal.icon}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <div style={{ fontWeight: 600 }}>{goal.title}</div>
                                                {unlocked && <Badge bg="success">Unlocked</Badge>}
                                            </div>
                                            {goal.description && <div className="text-muted" style={{ fontSize: 13 }}>{goal.description}</div>}
                                        </div>
                                    </div>

                                    <div style={{ marginTop: 8 }}>
                                        <ProgressBar now={pct} label={`${curr}/${req}`} />
                                        <div className="progress-label" style={{ marginTop: 8 }}>
                                            {goal.unit ? `${curr} / ${req} ${goal.unit}` : `${curr} / ${req}`}
                                        </div>
                                    </div>

                                    <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                        {!unlocked ? (
                                            <>
                                                <Button size="sm" variant="outline-secondary" onClick={() => incrementGoalManual(goal.id, 1)}>+1</Button>
                                                <Button size="sm" variant="outline-secondary" onClick={() => { const by = Number(prompt("Enter amount to add:", "1")) || 0; if (by > 0) incrementGoalManual(goal.id, by); }}>+custom</Button>
                                                <Button size="sm" variant="outline-secondary" onClick={() => resetGoal(goal.id)}>Reset</Button>
                                            </>
                                        ) : (
                                            <Button size="sm" variant="success" disabled>🎉 Completed</Button>
                                        )}
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    );
                })}
            </Row>

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
