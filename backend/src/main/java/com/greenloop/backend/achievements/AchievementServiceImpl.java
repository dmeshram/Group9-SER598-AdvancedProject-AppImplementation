package com.greenloop.backend.achievements;

import com.greenloop.backend.activity.ActivityEntity;
import com.greenloop.backend.user.UserEntity;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@Transactional
public class AchievementServiceImpl implements AchievementService {

    private final AchievementRepository achievementRepo;
    private final UserAchievementRepository userAchievementRepo;

    public AchievementServiceImpl(
            AchievementRepository achievementRepo,
            UserAchievementRepository userAchievementRepo) {
        this.achievementRepo = achievementRepo;
        this.userAchievementRepo = userAchievementRepo;
    }

    @Override
    public void processActivityForUser(UserEntity user, ActivityEntity activity) {

        String activityType = activity.getActivityType().name().toLowerCase();
        double amount = activity.getAmount();

        var goals = achievementRepo.findAll()
                .stream()
                .filter(a -> a.getActivityType().equalsIgnoreCase(activityType)
                        || a.getActivityType().equalsIgnoreCase("other"))
                .toList();

        for (var g : goals) {

            // find existing or create new
            var uaOpt = userAchievementRepo.findByUserAndAchievement_Id(user, g.getId());
            var ua = uaOpt.orElseGet(() -> {
                var id = new UserAchievementEntity.UserAchievementId(user.getId(), g.getId());
                var e = new UserAchievementEntity();
                e.setId(id);
                e.setUser(user);
                e.setAchievement(g);
                e.setProgress(0);
                return e;
            });

            double increment = computeIncrement(g, activity, amount);
            double newProgress = ua.getProgress() + increment;
            ua.setProgress(newProgress);

            if (ua.getUnlockedAt() == null && newProgress >= g.getRequired()) {
                ua.setUnlockedAt(OffsetDateTime.now());
            }

            userAchievementRepo.save(ua);
        }
    }

    private double computeIncrement(AchievementEntity g, ActivityEntity a, double amount) {

        String unit = g.getUnit().toLowerCase();

        return switch (unit) {
            case "steps" -> amount;
            case "km", "kilometers" -> amount;
            case "items" -> amount;
            case "actions" -> 1;
            case "days" -> 0; // streaks separately
            default -> 1;
        };
    }

    @Override
    public List<UserAchievementDto> getUserAchievements(UserEntity user) {
        return userAchievementRepo.findByUser(user)
                .stream()
                .map(UserAchievementDto::fromEntity)
                .toList();
    }

    @Override
    public List<AchievementEntity> getAllAchievementDefinitions() {
        return achievementRepo.findAll();
    }

    public static class UserAchievementDto {
        public String id;
        public String title;
        public String description;
        public double required;
        public String unit;
        public double progress;
        public OffsetDateTime unlockedAt;

        public static UserAchievementDto fromEntity(UserAchievementEntity ua) {
            var g = ua.getAchievement();
            var dto = new UserAchievementDto();
            dto.id = g.getId();
            dto.title = g.getTitle();
            dto.description = g.getDescription();
            dto.required = g.getRequired();
            dto.unit = g.getUnit();
            dto.progress = ua.getProgress();
            dto.unlockedAt = ua.getUnlockedAt();
            return dto;
        }
    }
}
