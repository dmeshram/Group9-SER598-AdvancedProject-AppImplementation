package com.greenloop.backend.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/goals")
@Tag(name = "Goals", description = "Achievements, goal definitions, and progress")
public class GoalsController {

    @GetMapping
    @Operation(summary = "Get all goals + user progress")
    public Map<String, Object> getGoals() {
        // Static demo data for now
        List<Map<String, Object>> goals = new ArrayList<>();

        Map<String, Object> g1 = new HashMap<>();
        g1.put("id", 1);
        g1.put("title", "First Login");
        g1.put("description", "Log in to the app once");
        g1.put("required", 1);
        g1.put("icon", "trophy");
        g1.put("systemDefined", true);
        goals.add(g1);

        List<Map<String, Object>> progress = new ArrayList<>();
        Map<String, Object> p1 = new HashMap<>();
        p1.put("goalId", 1);
        p1.put("progress", 1);
        p1.put("unlockedAt", null);
        progress.add(p1);

        Map<String, Object> response = new HashMap<>();
        response.put("goals", goals);
        response.put("progress", progress);

        return response;
    }

    @PostMapping
    @Operation(summary = "Create a custom user goal")
    public Map<String, Object> createGoal(@RequestBody Map<String, Object> request) {
        request.putIfAbsent("id", 999);
        request.put("systemDefined", false);
        return request;
    }

    @PostMapping("/{goalId}/increment")
    @Operation(summary = "Increment progress for a goal")
    public Map<String, Object> increment(
            @PathVariable Long goalId,
            @RequestBody Map<String, Integer> body
    ) {
        int by = body.getOrDefault("by", 1);
        Map<String, Object> result = new HashMap<>();
        result.put("goalId", goalId);
        result.put("progress", by); // demo only
        result.put("unlockedAt", null);
        return result;
    }

    @PutMapping("/{goalId}/progress")
    @Operation(summary = "Set absolute progress for a goal")
    public Map<String, Object> setProgress(
            @PathVariable Long goalId,
            @RequestBody Map<String, Integer> body
    ) {
        int progress = body.getOrDefault("progress", 0);
        Map<String, Object> result = new HashMap<>();
        result.put("goalId", goalId);
        result.put("progress", progress);
        result.put("unlockedAt", null);
        return result;
    }
}
