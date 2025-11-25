package com.greenloop.backend.goals;

import com.greenloop.backend.user.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GoalProgressRepository extends JpaRepository<GoalProgressEntity, Long> {

    List<GoalProgressEntity> findByUser(UserEntity user);

    Optional<GoalProgressEntity> findByUserAndGoal(UserEntity user, GoalEntity goal);
}
