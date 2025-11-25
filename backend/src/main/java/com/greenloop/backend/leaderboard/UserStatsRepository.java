package com.greenloop.backend.leaderboard;

import com.greenloop.backend.leaderboard.UserStatsEntity.PeriodType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;

public interface UserStatsRepository extends JpaRepository<UserStatsEntity, Long> {

    Page<UserStatsEntity> findByPeriodTypeAndPeriodStart(
            PeriodType periodType,
            LocalDate periodStart,
            Pageable pageable
    );

    Page<UserStatsEntity> findByPeriodType(
            PeriodType periodType,
            Pageable pageable
    );
}
