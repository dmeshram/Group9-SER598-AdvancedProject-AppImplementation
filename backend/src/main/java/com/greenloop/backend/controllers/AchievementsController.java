package com.greenloop.backend.controllers;

import com.greenloop.backend.auth.AuthTokenResolver;
import com.greenloop.backend.user.UserEntity;
import com.greenloop.backend.user.UserRepository;
import com.greenloop.backend.achievements.AchievementEntity;
import com.greenloop.backend.achievements.AchievementService;
import com.greenloop.backend.achievements.AchievementServiceImpl;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/achievements")
@CrossOrigin(origins = "http://localhost:5173")
public class AchievementsController {

    private final AchievementService achievementService;
    private final UserRepository userRepo;
    private final AuthTokenResolver tokenResolver;

    public AchievementsController(AchievementService achievementService,
                                  UserRepository userRepo,
                                  AuthTokenResolver tokenResolver) {
        this.achievementService = achievementService;
        this.userRepo = userRepo;
        this.tokenResolver = tokenResolver;
    }

    private UserEntity getCurrentUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing bearer token");
        }

        String token = authHeader.substring("Bearer ".length()).trim();
        var auth = tokenResolver.resolve(token);

        UserEntity user;
        if (auth.type() == AuthTokenResolver.AuthType.GOOGLE) {
            // Google login: use googleId column
            user = userRepo.findByGoogleId(auth.userId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        } else {
            // Local login: use email column
            user = userRepo.findByEmail(auth.email())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        }

        return user;
    }

    @GetMapping
    public List<AchievementServiceImpl.UserAchievementDto> getMyAchievements(
            @RequestHeader("Authorization") String authHeader) {

        UserEntity user = getCurrentUser(authHeader);
        return achievementService.getUserAchievements(user);
    }

    @GetMapping("/master")
    public List<AchievementEntity> getMaster() {
        return achievementService.getAllAchievementDefinitions();
    }
}