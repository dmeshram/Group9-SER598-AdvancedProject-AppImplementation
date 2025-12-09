package com.greenloop.backend.leaderboard;

import com.greenloop.backend.activity.ActivityEntity;
import com.greenloop.backend.activity.ActivityRepository;
import com.greenloop.backend.activity.ActivityType;
import com.greenloop.backend.dto.leaderboard.LeaderboardResponse;
import com.greenloop.backend.dto.leaderboard.LeaderboardUserDto;
import com.greenloop.backend.user.UserEntity;
import com.greenloop.backend.user.UserRepository;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class LeaderboardService {

    private final UserRepository userRepository;
    private final ActivityRepository activityRepository;

    public LeaderboardService(UserRepository userRepository,
                              ActivityRepository activityRepository) {
        this.userRepository = userRepository;
        this.activityRepository = activityRepository;
    }

    /**
     * Build leaderboard from existing users + activities.
     *
     * @param view   "week" | "month" | "all"
     * @param limit  max rows to return
     * @param offset starting index (for pagination)
     */
    public LeaderboardResponse getLeaderboard(String view, int limit, int offset) {
        String normalizedView = normalizeView(view);
        LocalDate today = LocalDate.now();

        LocalDate rangeStart;
        switch (normalizedView) {
            case "month" -> rangeStart = today.withDayOfMonth(1);
            case "all" -> rangeStart = null;
            case "week" -> rangeStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            default -> rangeStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        }

        if (limit <= 0) {
            limit = 50;
        }
        if (offset < 0) {
            offset = 0;
        }

        List<UserEntity> allUsers = userRepository.findAll();
        List<LeaderboardUserDto> rows = new ArrayList<>();

        boolean includeZeroActivityUsers = "all".equals(normalizedView);

        for (UserEntity user : allUsers) {
            List<ActivityEntity> allActivities =
                    activityRepository.findByUserOrderByDateAsc(user);

            if (allActivities.isEmpty() && !includeZeroActivityUsers) {
                continue;
            }

            List<ActivityEntity> scoringActivities = new ArrayList<>();
            if (rangeStart == null) {
                scoringActivities.addAll(allActivities);
            } else {
                for (ActivityEntity a : allActivities) {
                    LocalDate d = a.getDate();
                    if (!d.isBefore(rangeStart) && !d.isAfter(today)) {
                        scoringActivities.add(a);
                    }
                }
            }

            int points = scoringActivities.stream()
                    .mapToInt(ActivityEntity::getPoints)
                    .sum();

            double co2SavedKg = scoringActivities.stream()
                    .mapToDouble(a -> estimateCo2SavedKg(
                            a.getActivityType(),
                            a.getAmount(),
                            a.getUnit()
                    ))
                    .sum();

            int streakDays = computeCurrentStreak(allActivities);

            if (!includeZeroActivityUsers && points == 0) {
                continue;
            }

            rows.add(new LeaderboardUserDto(
                    user.getId(),
                    user.getName(),
                    user.getEmail(),
                    co2SavedKg,
                    points,
                    streakDays,
                    0,
                    null,
                    0.0,
                    0,
                    false
            ));
        }

        rows.sort(Comparator.comparingInt(LeaderboardUserDto::weeklyPoints).reversed());

        long total = rows.size();

        int fromIndex = Math.min(offset, rows.size());
        int toIndex = Math.min(offset + limit, rows.size());
        List<LeaderboardUserDto> page = new ArrayList<>();

        for (int i = fromIndex; i < toIndex; i++) {
            LeaderboardUserDto u = rows.get(i);
            int rank = i + 1;

            page.add(new LeaderboardUserDto(
                    u.id(),
                    u.name(),
                    u.email(),
                    u.totalCarbonSavedKg(),
                    u.weeklyPoints(),
                    u.streakDays(),
                    u.completedGoals(),
                    u.level(),
                    u.percentile(),
                    rank,
                    u.isCurrentUser()
            ));
        }

        return new LeaderboardResponse(
                normalizedView,
                limit,
                offset,
                total,
                page
        );
    }

    private String normalizeView(String raw) {
        if (raw == null) return "week";
        String v = raw.toLowerCase();
        return switch (v) {
            case "month", "monthly" -> "month";
            case "all", "all_time", "alltime" -> "all";
            default -> "week";
        };
    }

    private int computeCurrentStreak(List<ActivityEntity> allActivities) {
        if (allActivities.isEmpty()) {
            return 0;
        }

        LocalDate today = LocalDate.now();
        int streak = 0;
        LocalDate cursor = today;
        int index = allActivities.size() - 1;

        while (index >= 0) {
            LocalDate day = allActivities.get(index).getDate();

            if (day.isAfter(cursor)) {
                index--;
                continue;
            }

            if (day.isEqual(cursor)) {
                streak++;

                while (index >= 0 &&
                        allActivities.get(index).getDate().isEqual(day)) {
                    index--;
                }

                cursor = cursor.minusDays(1);
            } else {
                break;
            }
        }

        return streak;
    }

    private double estimateCo2SavedKg(ActivityType type, double amount, String unit) {
        double km;

        if (unit != null && unit.equalsIgnoreCase("km")) {
            km = amount;
        } else if (unit != null &&
                (unit.equalsIgnoreCase("minutes") || unit.equalsIgnoreCase("mins"))) {
            km = amount * 0.1;
        } else {
            km = amount * 0.2;
        }

        double perKmFactor = switch (type) {
            case WALKING, CYCLING -> 0.21;
            case PUBLIC_TRANSPORT -> 0.10;
            case REUSEABLE_ITEMS, RECYCLING -> 0.05;
            default -> 0.03;
        };

        return km * perKmFactor;
    }
}
