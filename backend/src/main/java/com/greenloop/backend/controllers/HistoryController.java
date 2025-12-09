package com.greenloop.backend.controllers;

import com.greenloop.backend.activity.ActivityEntity;
import com.greenloop.backend.activity.ActivityRepository;
import com.greenloop.backend.activity.ActivityService;
import com.greenloop.backend.auth.AuthTokenResolver;
import com.greenloop.backend.achievements.AchievementService;
import com.greenloop.backend.achievements.AchievementServiceImpl;
import com.greenloop.backend.history.HistoryResponse;
import com.greenloop.backend.user.UserEntity;
import com.greenloop.backend.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/history")
@CrossOrigin(origins = "http://localhost:5173")
public class HistoryController {

    private final AuthTokenResolver tokenResolver;
    private final UserRepository userRepo;
    private final ActivityRepository activityRepo;
    private final ActivityService activityService;
    private final AchievementService achievementService;

    public HistoryController(AuthTokenResolver tokenResolver,
                             UserRepository userRepo,
                             ActivityRepository activityRepo,
                             ActivityService activityService,
                             AchievementService achievementService) {
        this.tokenResolver = tokenResolver;
        this.userRepo = userRepo;
        this.activityRepo = activityRepo;
        this.activityService = activityService;
        this.achievementService = achievementService;
    }

    private UserEntity getCurrentUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing bearer token");
        }
        var auth = tokenResolver.resolve(authHeader.substring("Bearer ".length()));
        return userRepo.findById(Long.valueOf(auth.userId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    @GetMapping
    public HistoryResponse getMyHistory(@RequestHeader("Authorization") String authHeader) {
        UserEntity user = getCurrentUser(authHeader);

        // all activities for this user (ascending by date)
        List<ActivityEntity> allActivities = activityRepo.findByUserOrderByDateAsc(user);

        // 1) streak: reuse your HomeSummary logic
        var summary = activityService.buildSummary(user);

        HistoryResponse resp = new HistoryResponse();
        resp.setStreakDays(summary.currentStreak()); // adjust if getter is different

        // 2) achievements: use AchievementService
        List<AchievementServiceImpl.UserAchievementDto> userAchievements =
                achievementService.getUserAchievements(user);

        List<HistoryResponse.AchievementItem> achievementItems =
                userAchievements.stream()
                        .filter(a -> a.unlockedAt != null) // only unlocked
                        .map(a -> {
                            HistoryResponse.AchievementItem item = new HistoryResponse.AchievementItem();
                            item.setId(a.id);
                            item.setTitle(a.title);
                            item.setDate(a.unlockedAt.toLocalDate().toString());
                            return item;
                        })
                        .sorted(Comparator.comparing(HistoryResponse.AchievementItem::getDate).reversed())
                        .toList();

        resp.setAchievements(achievementItems);

        // 3) completedActivities: last 30 days
        LocalDate today = LocalDate.now();
        LocalDate thirtyDaysAgo = today.minusDays(29);

        List<ActivityEntity> last30 =
                allActivities.stream()
                        .filter(a -> !a.getDate().isBefore(thirtyDaysAgo))
                        .sorted(Comparator.comparing(ActivityEntity::getDate).reversed())
                        .limit(50)
                        .toList();

        List<HistoryResponse.ActivityItem> activityItems =
                last30.stream()
                        .map(a -> {
                            HistoryResponse.ActivityItem item = new HistoryResponse.ActivityItem();
                            item.setDate(a.getDate().toString());
                            item.setActivity(activityLabel(a));
                            double co2 = activityService.estimateCo2SavedKg(
                                    a.getActivityType(), a.getAmount(), a.getUnit());
                            item.setCo2Saved(co2);
                            return item;
                        })
                        .toList();

        resp.setCompletedActivities(activityItems);

        // 4) CO2 trend: last 7 days per-day sum
        LocalDate weekStart = today.minusDays(6);
        List<HistoryResponse.Co2TrendPoint> trend = new ArrayList<>();

        for (int i = 0; i < 7; i++) {
            LocalDate d = weekStart.plusDays(i);
            double co2ForDay = allActivities.stream()
                    .filter(a -> a.getDate().equals(d))
                    .mapToDouble(a -> activityService.estimateCo2SavedKg(
                            a.getActivityType(), a.getAmount(), a.getUnit()))
                    .sum();

            HistoryResponse.Co2TrendPoint p = new HistoryResponse.Co2TrendPoint();
            p.setDay(shortDayName(d.getDayOfWeek()));
            p.setKg(co2ForDay);
            trend.add(p);
        }
        resp.setCo2Trend(trend);

        // 5) calendar: last 30 days, mark completed days
        Set<LocalDate> activeDays =
                allActivities.stream()
                        .map(ActivityEntity::getDate)
                        .collect(Collectors.toSet());

        List<HistoryResponse.CalendarEntry> calendarEntries = new ArrayList<>();
        for (LocalDate d = thirtyDaysAgo; !d.isAfter(today); d = d.plusDays(1)) {
            HistoryResponse.CalendarEntry entry = new HistoryResponse.CalendarEntry();
            entry.setDate(d.toString());
            entry.setCompleted(activeDays.contains(d));
            calendarEntries.add(entry);
        }
        resp.setCalendar(calendarEntries);

        return resp;
    }

    // --- helpers ---

    private String shortDayName(DayOfWeek dow) {
        // e.g. MONDAY -> Mon
        String name = dow.name().substring(0, 3);
        return name.charAt(0) + name.substring(1).toLowerCase();
    }

    private String activityLabel(ActivityEntity a) {
        // nice human label from type
        String base = switch (a.getActivityType()) {
            case WALKING -> "Walked instead of driving";
            case CYCLING -> "Cycled";
            case PUBLIC_TRANSPORT -> "Used public transport";
            case REUSEABLE_ITEMS -> "Used reusable items";
            case RECYCLING -> "Recycling";
            case OTHER -> "Other sustainable action";
        };
        return base;
    }
}