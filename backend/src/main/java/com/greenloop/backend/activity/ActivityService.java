package com.greenloop.backend.activity;

import com.greenloop.backend.home.HomeSummary;
import com.greenloop.backend.user.UserEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ActivityService {

    private static final int WEEKLY_GOAL_DAYS = 5;
    private final ActivityRepository activityRepo;

    public ActivityService(ActivityRepository activityRepo) {
        this.activityRepo = activityRepo;
    }

    public int calculatePoints(ActivityType type, double amount, String unit) {
        double base;

        switch (type) {
            case WALKING -> base = 2.0;
            case CYCLING -> base = 3.0;
            case PUBLIC_TRANSPORT -> base = 4.0;
            case REUSEABLE_ITEMS, RECYCLING -> base = 1.5;
            default -> base = 1.0;
        }

        double factor;
        if ("minutes".equalsIgnoreCase(unit)) {
            factor = amount / 10.0; 
        } else if ("km".equalsIgnoreCase(unit)) {
            factor = amount;       
        } else { 
            factor = amount;
        }

        int pts = (int) Math.round(base * factor);
        return Math.max(1, pts); 
    }

    public double estimateCo2SavedKg(ActivityType type, double amount, String unit) {
        double km;

        if ("km".equalsIgnoreCase(unit)) {
            km = amount;
        } else if ("minutes".equalsIgnoreCase(unit)) {
            km = (amount / 60.0) * 5.0;
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

    private int computeCurrentStreak(List<ActivityEntity> activities) {
        if (activities.isEmpty()) {
            return 0;
        }

        Set<LocalDate> daysWithActivity = new HashSet<>();
        for (ActivityEntity a : activities) {
            daysWithActivity.add(a.getDate());
        }

        LocalDate today = LocalDate.now();
        int streak = 0;
        LocalDate cursor = today;

        while (daysWithActivity.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }

        return streak;
    }

    public HomeSummary buildSummary(UserEntity user) {
        List<ActivityEntity> all = activityRepo.findByUserOrderByDateAsc(user);

        int totalPoints = all.stream()
                .mapToInt(ActivityEntity::getPoints)
                .sum();

        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.minusDays(6);

        int weeklyPoints = all.stream()
                .filter(a -> !a.getDate().isBefore(weekStart) && !a.getDate().isAfter(today))
                .mapToInt(ActivityEntity::getPoints)
                .sum();

        int weeklyActiveDays = all.stream()
                .map(ActivityEntity::getDate)
                .filter(d -> !d.isBefore(weekStart) && !d.isAfter(today))
                .collect(Collectors.toSet())
                .size();

        double co2SavedKg = all.stream()
                .mapToDouble(a -> estimateCo2SavedKg(a.getActivityType(), a.getAmount(), a.getUnit()))
                .sum();

        int currentStreak = computeCurrentStreak(all);

        return new HomeSummary(totalPoints, weeklyPoints, co2SavedKg, currentStreak, WEEKLY_GOAL_DAYS, weeklyActiveDays);
    }
}