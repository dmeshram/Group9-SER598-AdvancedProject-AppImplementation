package com.greenloop.backend.dto.goals;

public record CreateGoalRequest(
        String title,
        String description,
        int required,
        String icon
) {}
