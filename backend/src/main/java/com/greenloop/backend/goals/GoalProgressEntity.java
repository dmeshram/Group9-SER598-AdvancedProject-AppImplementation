package com.greenloop.backend.goals;

import com.greenloop.backend.user.UserEntity;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(
        name = "goal_progress",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "goal_id"})
)
public class GoalProgressEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "goal_id", nullable = false)
    private GoalEntity goal;

    private int progress;

    private Instant unlockedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UserEntity getUser() { return user; }
    public void setUser(UserEntity user) { this.user = user; }

    public GoalEntity getGoal() { return goal; }
    public void setGoal(GoalEntity goal) { this.goal = goal; }

    public int getProgress() { return progress; }
    public void setProgress(int progress) { this.progress = progress; }

    public Instant getUnlockedAt() { return unlockedAt; }
    public void setUnlockedAt(Instant unlockedAt) { this.unlockedAt = unlockedAt; }
}
