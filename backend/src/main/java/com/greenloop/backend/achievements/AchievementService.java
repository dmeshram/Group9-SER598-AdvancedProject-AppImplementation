package com.greenloop.backend.achievements;

import com.greenloop.backend.activity.ActivityEntity;
import com.greenloop.backend.user.UserEntity;

import java.util.List;

public interface AchievementService {

    void processActivityForUser(UserEntity user, ActivityEntity activity);

    List<AchievementServiceImpl.UserAchievementDto> getUserAchievements(UserEntity user);

    List<AchievementEntity> getAllAchievementDefinitions();
}
