package com.greenloop.backend.dto.goals;

import java.util.List;

public record GoalsResponse(
        List<GoalDto> goals,
        List<GoalProgressDto> progress
) {}
