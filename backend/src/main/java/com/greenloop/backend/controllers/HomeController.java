package com.greenloop.backend.controllers;

import com.greenloop.backend.activity.ActivityService;
import com.greenloop.backend.auth.AuthTokenResolver;
import com.greenloop.backend.home.HomeSummary;
import com.greenloop.backend.user.UserEntity;
import com.greenloop.backend.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/home")
@CrossOrigin(origins = "http://localhost:5173")
public class HomeController {

    private final ActivityService activityService;
    private final UserRepository userRepo;
    private final AuthTokenResolver tokenResolver;

    public HomeController(ActivityService activityService,
                               UserRepository userRepo,
                               AuthTokenResolver tokenResolver) {
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

    @GetMapping("/summary")
    public HomeSummary summary(@RequestHeader("Authorization") String authHeader) {
        UserEntity user = getCurrentUser(authHeader);
        return activityService.buildSummary(user);
    }
}