package com.greenloop.backend.controllers;

import com.greenloop.backend.dto.goals.*;
import com.greenloop.backend.goals.GoalsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/goals")
@Tag(name = "Goals", description = "Achievements, goal definitions, and progress")
public class GoalsController {

    private final GoalsService goalsService;

    public GoalsController(GoalsService goalsService) {
        this.goalsService = goalsService;
    }

    private Long getCurrentUserId() { return 1L; } // TODO: wire to auth

    @GetMapping
    @Operation(summary = "Get all goals + user progress")
    public GoalsResponse getGoals() {
        return goalsService.getGoals(getCurrentUserId());
    }

    @PostMapping
    @Operation(summary = "Create a custom user goal")
    public GoalDto createGoal(@RequestBody CreateGoalRequest request) {
        return goalsService.createGoal(getCurrentUserId(), request);
    }

    @PostMapping("/{goalId}/increment")
    @Operation(summary = "Increment progress for a goal")
    public GoalProgressDto increment(
            @PathVariable Long goalId,
            @RequestBody IncrementRequest body
    ) {
        return goalsService.incrementProgress(getCurrentUserId(), goalId, body.by());
    }

    @PutMapping("/{goalId}/progress")
    @Operation(summary = "Set absolute progress for a goal")
    public GoalProgressDto setProgress(
            @PathVariable Long goalId,
            @RequestBody SetProgressRequest body
    ) {
        return goalsService.setProgress(getCurrentUserId(), goalId, body.progress());
    }
}
