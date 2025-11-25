package com.greenloop.backend.dto.goals;

public record GoalDto(
        Long id,
        String title,
        String description,
        int required,          // number of actions needed
        String icon,
        boolean systemDefined
) {}
