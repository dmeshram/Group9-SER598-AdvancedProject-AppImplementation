package com.greenloop.backend.activity;

import com.greenloop.backend.user.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface ActivityRepository extends JpaRepository<ActivityEntity, Long> {

    List<ActivityEntity> findTop5ByUserOrderByDateDescCreatedAtDesc(UserEntity user);

    List<ActivityEntity> findByUserAndDateBetween(
            UserEntity user,
            LocalDate start,
            LocalDate end
    );

    List<ActivityEntity> findByUserOrderByDateAsc(UserEntity user);
}
