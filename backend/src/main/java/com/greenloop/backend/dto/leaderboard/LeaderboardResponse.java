package com.greenloop.backend.dto.leaderboard;

import java.util.List;

public record LeaderboardResponse(
        String view,
        int limit,
        int offset,
        long total,
        List<LeaderboardUserDto> users
) {}
