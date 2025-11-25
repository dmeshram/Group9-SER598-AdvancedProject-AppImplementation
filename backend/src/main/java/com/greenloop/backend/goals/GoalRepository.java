package com.greenloop.backend.goals;

import com.greenloop.backend.user.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GoalRepository extends JpaRepository<GoalEntity, Long> {

    List<GoalEntity> findBySystemDefinedTrue();

    List<GoalEntity> findByOwnerUser(UserEntity owner);
}
