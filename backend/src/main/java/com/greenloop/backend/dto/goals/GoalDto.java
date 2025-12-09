package com.greenloop.backend.dto.goals;

public record GoalDto(
        Long id,
        String title,
        String description,
        int required,
        String icon,
        boolean systemDefined
) {}
