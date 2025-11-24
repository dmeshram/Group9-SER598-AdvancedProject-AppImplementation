package com.greenloop.backend.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/leaderboard")
@Tag(name = "Leaderboard", description = "Ranks, stats, and user comparisons")
public class LeaderboardController {

    @GetMapping
    @Operation(summary = "Get leaderboard for week/month/all-time")
    public Map<String, Object> getLeaderboard(
            @RequestParam(defaultValue = "week") String view,
            @RequestParam(defaultValue = "50") int limit,
            @RequestParam(defaultValue = "0") int offset
    ) {
        // Static demo list with just the current user
        List<Map<String, Object>> users = new ArrayList<>();

        Map<String, Object> currentUser = new HashMap<>();
        currentUser.put("id", 1);
        currentUser.put("name", "You");
        currentUser.put("email", "you@example.com");
        currentUser.put("totalCarbonSavedKg", 123.4);
        currentUser.put("weeklyPoints", 320);
        currentUser.put("streakDays", 10);
        currentUser.put("completedGoals", 5);
        currentUser.put("level", "Eco Warrior");
        currentUser.put("percentile", 95);
        currentUser.put("rank", 1);
        currentUser.put("isCurrentUser", true);
        users.add(currentUser);

        Map<String, Object> response = new HashMap<>();
        response.put("view", view);
        response.put("limit", limit);
        response.put("offset", offset);
        response.put("total", 1);
        response.put("users", users);

        return response;
    }
}
