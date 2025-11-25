package com.greenloop.backend.goals;

import com.greenloop.backend.dto.goals.*;
import com.greenloop.backend.user.UserEntity;
import com.greenloop.backend.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class GoalsService {

    private final GoalRepository goalRepository;
    private final GoalProgressRepository progressRepository;
    private final UserRepository userRepository;

    public GoalsService(GoalRepository goalRepository,
                        GoalProgressRepository progressRepository,
                        UserRepository userRepository) {
        this.goalRepository = goalRepository;
        this.progressRepository = progressRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public GoalsResponse getGoals(Long userId) {
        UserEntity user = getUser(userId);

        List<GoalEntity> systemGoals = goalRepository.findBySystemDefinedTrue();
        List<GoalEntity> userGoals = goalRepository.findByOwnerUser(user);

        List<GoalDto> goalDtos = new ArrayList<>();
        systemGoals.forEach(g -> goalDtos.add(toGoalDto(g)));
        userGoals.forEach(g -> goalDtos.add(toGoalDto(g)));

        List<GoalProgressEntity> progressEntities = progressRepository.findByUser(user);
        List<GoalProgressDto> progressDtos = progressEntities.stream()
                .map(this::toProgressDto)
                .toList();

        return new GoalsResponse(goalDtos, progressDtos);
    }

    @Transactional
    public GoalDto createGoal(Long userId, CreateGoalRequest request) {
        UserEntity user = getUser(userId);

        GoalEntity goal = new GoalEntity();
        goal.setTitle(request.title());
        goal.setDescription(request.description());
        goal.setRequired(request.required());
        goal.setIcon(request.icon());
        goal.setSystemDefined(false);
        goal.setOwnerUser(user);

        goalRepository.save(goal);
        return toGoalDto(goal);
    }

    @Transactional
    public GoalProgressDto incrementProgress(Long userId, Long goalId, int by) {
        UserEntity user = getUser(userId);
        GoalEntity goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Goal not found"));

        GoalProgressEntity progress = progressRepository
                .findByUserAndGoal(user, goal)
                .orElseGet(() -> {
                    GoalProgressEntity p = new GoalProgressEntity();
                    p.setUser(user);
                    p.setGoal(goal);
                    p.setProgress(0);
                    return p;
                });

        progress.setProgress(progress.getProgress() + by);

        if (progress.getProgress() >= goal.getRequired() && progress.getUnlockedAt() == null) {
            progress.setUnlockedAt(Instant.now());
        }

        progressRepository.save(progress);
        return toProgressDto(progress);
    }

    @Transactional
    public GoalProgressDto setProgress(Long userId, Long goalId, int value) {
        UserEntity user = getUser(userId);
        GoalEntity goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Goal not found"));

        GoalProgressEntity progress = progressRepository
                .findByUserAndGoal(user, goal)
                .orElseGet(() -> {
                    GoalProgressEntity p = new GoalProgressEntity();
                    p.setUser(user);
                    p.setGoal(goal);
                    return p;
                });

        progress.setProgress(value);

        if (value >= goal.getRequired() && progress.getUnlockedAt() == null) {
            progress.setUnlockedAt(Instant.now());
        }

        progressRepository.save(progress);
        return toProgressDto(progress);
    }

    private UserEntity getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private GoalDto toGoalDto(GoalEntity g) {
        return new GoalDto(
                g.getId(),
                g.getTitle(),
                g.getDescription(),
                g.getRequired(),
                g.getIcon(),
                g.isSystemDefined()
        );
    }

    private GoalProgressDto toProgressDto(GoalProgressEntity p) {
        return new GoalProgressDto(
                p.getGoal().getId(),
                p.getProgress(),
                p.getUnlockedAt()
        );
    }
}
