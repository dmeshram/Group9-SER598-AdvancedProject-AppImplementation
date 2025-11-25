package com.greenloop.backend.dto.leaderboard;

public record LeaderboardUserDto(
        Long id,
        String name,
        String email,
        double totalCarbonSavedKg,
        int weeklyPoints,
        int streakDays,
        int completedGoals,
        String level,
        double percentile,
        int rank,
        boolean isCurrentUser
) {}
