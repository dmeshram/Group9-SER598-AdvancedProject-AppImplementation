package com.greenloop.backend.controllers;

import com.greenloop.backend.activity.ActivityEntity;
import com.greenloop.backend.activity.ActivityRepository;
import com.greenloop.backend.activity.ActivityService;
import com.greenloop.backend.activity.ActivityType;
import com.greenloop.backend.auth.AuthTokenResolver;
import com.greenloop.backend.user.UserEntity;
import com.greenloop.backend.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/activities")
@CrossOrigin(origins = "http://localhost:5173")
public class ActivityController {

    private final ActivityRepository activityRepo;
    private final ActivityService activityService;
    private final UserRepository userRepo;
    private final AuthTokenResolver tokenResolver;

    public ActivityController(ActivityRepository activityRepo,
                              ActivityService activityService,
                              UserRepository userRepo,
                              AuthTokenResolver tokenResolver) {
        this.activityRepo = activityRepo;
        this.activityService = activityService;
        this.userRepo = userRepo;
        this.tokenResolver = tokenResolver;
    }

    private String extractBearer(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing bearer token");
        }
        return authHeader.substring("Bearer ".length());
    }

    private UserEntity getCurrentUser(String authHeader) {
        var token = extractBearer(authHeader);
        var authUser = tokenResolver.resolve(token);
        Long userId = Long.valueOf(authUser.userId());
        return userRepo.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "User not found"
            ));
    }
    
    public record LogActivityRequest(
            String type,  
            double amount,
            String unit,   
            LocalDate date
    ) {}

    public record ActivityDto(
            Long id,
            String type,
            double amount,
            String unit,
            LocalDate date,
            int points
    ) {}

    private ActivityDto toDto(ActivityEntity a) {
        return new ActivityDto(
                a.getId(),
                a.getActivityType().name(),
                a.getAmount(),
                a.getUnit(),
                a.getDate(),
                a.getPoints()
        );
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ActivityDto logActivity(@RequestHeader("Authorization") String authHeader,
                                   @RequestBody LogActivityRequest body) {

        UserEntity user = getCurrentUser(authHeader);

        ActivityType type;
        try {
            type = ActivityType.valueOf(body.type());
        } catch (IllegalArgumentException | NullPointerException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid activity type");
        }

        if (body.amount() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Amount must be positive");
        }

        LocalDate date = body.date() != null ? body.date() : LocalDate.now();
        String unit = (body.unit() == null || body.unit().isBlank())
                ? "minutes"
                : body.unit();

        int points = activityService.calculatePoints(type, body.amount(), unit);

        ActivityEntity entity = new ActivityEntity();
        entity.setUser(user);
        entity.setActivityType(type);
        entity.setAmount(body.amount());
        entity.setUnit(unit);
        entity.setDate(date);
        entity.setPoints(points);

        ActivityEntity saved = activityRepo.save(entity);
        return toDto(saved);
    }

    @GetMapping("/recent")
    public List<ActivityDto> recent(@RequestHeader("Authorization") String authHeader) {
        UserEntity user = getCurrentUser(authHeader);
        return activityRepo.findTop5ByUserOrderByDateDescCreatedAtDesc(user)
                .stream()
                .map(this::toDto)
                .toList();
    }
}