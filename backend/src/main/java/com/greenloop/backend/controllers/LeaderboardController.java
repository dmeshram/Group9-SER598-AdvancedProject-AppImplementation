package com.greenloop.backend.controllers;

import com.greenloop.backend.dto.leaderboard.LeaderboardResponse;
import com.greenloop.backend.leaderboard.LeaderboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/leaderboard")
@Tag(name = "Leaderboard", description = "Ranks, stats, and user comparisons")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    public LeaderboardController(LeaderboardService leaderboardService) {
        this.leaderboardService = leaderboardService;
    }

    @GetMapping
    @Operation(summary = "Get leaderboard for week/month/all-time")
    public LeaderboardResponse getLeaderboard(
            @RequestParam(defaultValue = "week") String view,
            @RequestParam(defaultValue = "50") int limit,
            @RequestParam(defaultValue = "0") int offset
    ) {
        return leaderboardService.getLeaderboard(view, limit, offset);
    }
}
