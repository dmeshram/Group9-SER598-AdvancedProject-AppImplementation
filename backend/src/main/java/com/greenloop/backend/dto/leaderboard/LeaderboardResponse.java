package com.greenloop.backend.dto.leaderboard;

import java.util.List;

public record LeaderboardResponse(
        String view,      // "week", "month", "all"
        int limit,
        int offset,
        long total,
        List<LeaderboardUserDto> users
) {}
