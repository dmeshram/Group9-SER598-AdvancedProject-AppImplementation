package com.greenloop.backend.leaderboard;

import com.greenloop.backend.dto.leaderboard.LeaderboardResponse;
import com.greenloop.backend.dto.leaderboard.LeaderboardUserDto;
import com.greenloop.backend.leaderboard.UserStatsEntity.PeriodType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

@Service
public class LeaderboardService {

    private final UserStatsRepository statsRepository;

    public LeaderboardService(UserStatsRepository statsRepository) {
        this.statsRepository = statsRepository;
    }

    public LeaderboardResponse getLeaderboard(String view, int limit, int offset) {
        PeriodType type = switch (view.toLowerCase()) {
            case "month", "monthly" -> PeriodType.MONTH;
            case "all", "all_time" -> PeriodType.ALL_TIME;
            default -> PeriodType.WEEK;
        };

        int page = offset / limit;
        PageRequest pageable = PageRequest.of(page, limit);

        Page<UserStatsEntity> pageResult;

        if (type == PeriodType.WEEK) {
            LocalDate monday = LocalDate.now().with(java.time.DayOfWeek.MONDAY);
            pageResult = statsRepository.findByPeriodTypeAndPeriodStart(type, monday, pageable);
        } else if (type == PeriodType.MONTH) {
            LocalDate firstOfMonth = LocalDate.now().with(TemporalAdjusters.firstDayOfMonth());
            pageResult = statsRepository.findByPeriodTypeAndPeriodStart(type, firstOfMonth, pageable);
        } else {
            pageResult = statsRepository.findByPeriodType(type, pageable);
        }

        List<LeaderboardUserDto> users = pageResult.getContent().stream()
                .map(this::toDto)
                .toList();

        return new LeaderboardResponse(
                view,
                limit,
                offset,
                pageResult.getTotalElements(),
                users
        );
    }

    private LeaderboardUserDto toDto(UserStatsEntity e) {
        // Rank & isCurrentUser can be refined later
        return new LeaderboardUserDto(
                e.getUser().getId(),
                e.getUser().getName(),
                e.getUser().getEmail(),
                e.getTotalCarbonSavedKg(),
                e.getWeeklyPoints(),
                e.getStreakDays(),
                e.getCompletedGoals(),
                e.getLevel(),
                e.getPercentile(),
                0,          // rank placeholder
                false       // isCurrentUser placeholder
        );
    }
}
