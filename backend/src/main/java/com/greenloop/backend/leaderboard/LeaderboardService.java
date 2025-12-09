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
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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

        // Determine scoring window
        LocalDate rangeStart = switch (normalizedView) {
            case "month" -> today.with(TemporalAdjusters.firstDayOfMonth());
            case "all" -> null; // all-time
            default -> today.with(DayOfWeek.MONDAY); // current week (Monday -> today)
        };

        List<UserEntity> allUsers = userRepository.findAll();
        List<LeaderboardUserDto> rows = new ArrayList<>();

        for (UserEntity user : allUsers) {
            // Get all activities once (for streak)
            List<ActivityEntity> allActivities = activityRepository.findByUserOrderByDateAsc(user);

            if (allActivities.isEmpty()) {
                // No activity at all -> skip user for now
                continue;
            }

            // For scoring, filter to selected window
            List<ActivityEntity> scoringActivities = new ArrayList<>();
            if (rangeStart == null) {
                scoringActivities.addAll(allActivities); // all-time
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

            if (points == 0) {
                // no points in this period -> don't show on leaderboard
                continue;
            }

            double co2SavedKg = scoringActivities.stream()
                    .mapToDouble(a -> estimateCo2SavedKg(
                            a.getActivityType(),
                            a.getAmount(),
                            a.getUnit()
                    ))
                    .sum();

            int streakDays = computeCurrentStreak(allActivities);

            rows.add(new LeaderboardUserDto(
                    user.getId(),
                    user.getName(),
                    user.getEmail(),
                    co2SavedKg,
                    points,
                    streakDays,
                    0,       // completedGoals – not modeled yet
                    null,    // level – not modeled yet
                    0.0,     // percentile – not used yet
                    0,       // rank – we fill after sorting
                    false    // isCurrentUser – can be wired when auth is ready
            ));
        }

        // Sort by points descending
        rows.sort(Comparator.comparingInt(LeaderboardUserDto::weeklyPoints).reversed());

        long total = rows.size();

        // Apply paging in memory
        int fromIndex = Math.min(offset, rows.size());
        int toIndex = Math.min(offset + limit, rows.size());
        List<LeaderboardUserDto> page = new ArrayList<>();

        for (int i = fromIndex; i < toIndex; i++) {
            LeaderboardUserDto u = rows.get(i);
            int rank = i + 1; // global rank

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

    /**
     * Current streak = number of consecutive days (counting back from today)
     * where the user logged at least one activity.
     */
    private int computeCurrentStreak(List<ActivityEntity> activities) {
        if (activities.isEmpty()) {
            return 0;
        }

        Set<LocalDate> daysWithActivity = new HashSet<>();
        for (ActivityEntity a : activities) {
            daysWithActivity.add(a.getDate());
        }

        int streak = 0;
        LocalDate cursor = LocalDate.now();

        while (daysWithActivity.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }

        return streak;
    }

    /**
     * Copy of the CO₂ estimation logic from ActivityService,
     * so the leaderboard numbers are consistent with the home summary.
     */
    private double estimateCo2SavedKg(ActivityType type, double amount, String unit) {
        double km;

        if ("km".equalsIgnoreCase(unit)) {
            km = amount;
        } else if ("minutes".equalsIgnoreCase(unit)) {
            km = (amount / 60.0) * 5.0; // assume ~5km/h
        } else {
            km = amount * 0.2; // fallback approximation
        }

        double perKmFactor = switch (type) {
            case WALKING, CYCLING -> 0.21;             // kg CO₂ per km vs car
            case PUBLIC_TRANSPORT -> 0.10;
            case REUSEABLE_ITEMS, RECYCLING -> 0.05;
            default -> 0.03;
        };

        return km * perKmFactor;
    }
}
