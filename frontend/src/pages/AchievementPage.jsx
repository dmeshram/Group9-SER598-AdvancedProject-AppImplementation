import React, { useState } from "react";

export default function AchievementsPage() {
    const [achievements, setAchievements] = useState([
        { title: "First Login", description: "Logged in successfully!", icon: "🏆" },
        { title: "Top Scorer", description: "Reached 100 points!", icon: "🥇" },
    ]);

    return (
        <div style={{ padding: "1rem" }}>
            <h1>Achievements</h1>
            <ul>
                {achievements.map((a, i) => (
                    <li key={i} style={{ margin: "10px 0" }}>
                        <span style={{ fontSize: "1.5rem", marginRight: "8px" }}>{a.icon}</span>
                        <strong>{a.title}</strong> — {a.description}
                    </li>
                ))}
            </ul>
        </div>
    );
}
