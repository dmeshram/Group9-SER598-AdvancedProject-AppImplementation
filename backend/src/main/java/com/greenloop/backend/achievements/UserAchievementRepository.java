package com.greenloop.backend.achievements;

import com.greenloop.backend.user.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserAchievementRepository
        extends JpaRepository<UserAchievementEntity, UserAchievementEntity.UserAchievementId> {

    List<UserAchievementEntity> findByUser(UserEntity user);

    Optional<UserAchievementEntity> findByUserAndAchievement_Id(UserEntity user, String achievementId);
}
