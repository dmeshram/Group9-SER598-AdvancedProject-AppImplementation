package com.greenloop.backend.leaderboard;

import com.greenloop.backend.user.UserEntity;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "user_stats")
public class UserStatsEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    private LocalDate periodStart;

    @Enumerated(EnumType.STRING)
    private PeriodType periodType; // WEEK, MONTH, ALL_TIME

    private double totalCarbonSavedKg;
    private int weeklyPoints;
    private int streakDays;
    private int completedGoals;
    private String level;      // e.g. "Eco Warrior"
    private double percentile; // 0–100

    public enum PeriodType {
        WEEK, MONTH, ALL_TIME
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UserEntity getUser() { return user; }
    public void setUser(UserEntity user) { this.user = user; }

    public LocalDate getPeriodStart() { return periodStart; }
    public void setPeriodStart(LocalDate periodStart) { this.periodStart = periodStart; }

    public PeriodType getPeriodType() { return periodType; }
    public void setPeriodType(PeriodType periodType) { this.periodType = periodType; }

    public double getTotalCarbonSavedKg() { return totalCarbonSavedKg; }
    public void setTotalCarbonSavedKg(double totalCarbonSavedKg) { this.totalCarbonSavedKg = totalCarbonSavedKg; }

    public int getWeeklyPoints() { return weeklyPoints; }
    public void setWeeklyPoints(int weeklyPoints) { this.weeklyPoints = weeklyPoints; }

    public int getStreakDays() { return streakDays; }
    public void setStreakDays(int streakDays) { this.streakDays = streakDays; }

    public int getCompletedGoals() { return completedGoals; }
    public void setCompletedGoals(int completedGoals) { this.completedGoals = completedGoals; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public double getPercentile() { return percentile; }
    public void setPercentile(double percentile) { this.percentile = percentile; }
}
