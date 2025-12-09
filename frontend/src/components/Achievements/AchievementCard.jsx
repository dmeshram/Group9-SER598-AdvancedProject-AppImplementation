import React from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import ProgressBar from "react-bootstrap/ProgressBar";
import Badge from "react-bootstrap/Badge";

const Icon = ({ type, unlocked }) => {
    const style = { fontSize: 28, width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center" };
    if (type === "medal") return <div style={style}>{unlocked ? "🏅" : "🔘"}</div>;
    if (type === "star") return <div style={style}>{unlocked ? "⭐" : "☆"}</div>;
    return <div style={style}>{unlocked ? "🏆" : "🔒"}</div>;
};

export default function AchievementCard({ goal, progress, onIncrement, onSetProgress }) {
    const unlocked = progress >= goal.required;
    const percent = Math.min(100, Math.round((progress / goal.required) * 100));

    return (
        <Card className="h-100">
            <Card.Body className="d-flex flex-column">
                <div className="d-flex align-items-start">
                    <Icon type={goal.icon} unlocked={unlocked} />
                    <div style={{ marginLeft: 12, flex: 1 }}>
                        <Card.Title style={{ marginBottom: 6 }}>{goal.title} {unlocked && <Badge bg="success">Unlocked</Badge>}</Card.Title>
                        {goal.description && <Card.Text className="text-muted" style={{ marginBottom: 8 }}>{goal.description}</Card.Text>}
                        <div style={{ marginTop: 6 }}>
                            <ProgressBar now={percent} label={`${progress}/${goal.required}`} />
                        </div>
                    </div>
                </div>

                <div className="mt-auto d-flex gap-2 justify-content-end">
                    {!unlocked && (
                        <>
                            <Button variant="outline-primary" size="sm" onClick={() => onIncrement(goal.id, 1)}>+1</Button>
                            <Button variant="outline-secondary" size="sm" onClick={() => onSetProgress(goal.id, 0)}>Reset</Button>
                        </>
                    )}
                    {unlocked && <Button variant="success" size="sm" disabled>Celebrate 🎉</Button>}
                </div>
            </Card.Body>
        </Card>
    );
}
