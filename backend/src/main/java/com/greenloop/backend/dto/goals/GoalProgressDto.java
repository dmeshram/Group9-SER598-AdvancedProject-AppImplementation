package com.greenloop.backend.dto.goals;

import java.time.Instant;

public record GoalProgressDto(
        Long goalId,
        int progress,
        Instant unlockedAt
) {}
