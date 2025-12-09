package com.greenloop.backend.controllers;

import com.greenloop.backend.auth.AuthTokenResolver;
import com.greenloop.backend.dto.profile.ProfileRequest;
import com.greenloop.backend.dto.profile.ProfileResponse;
import com.greenloop.backend.profile.ProfileService;
import com.greenloop.backend.user.UserEntity;
import com.greenloop.backend.user.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/profile")
@Tag(name = "Profile", description = "User profile + settings")
public class ProfileController {

    private final ProfileService profileService;
    private final UserRepository userRepository;
    private final AuthTokenResolver tokenResolver;

    public ProfileController(ProfileService profileService,
                             UserRepository userRepository,
                             AuthTokenResolver tokenResolver) {
        this.profileService = profileService;
        this.userRepository = userRepository;
        this.tokenResolver = tokenResolver;
    }

    private String extractBearer(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Missing bearer token"
            );
        }
        return authHeader.substring("Bearer ".length());
    }

    private Long getCurrentUserId(String authHeader) {
        // Decode the JWT (Google or local) and resolve the authenticated user
        var token = extractBearer(authHeader);
        var authUser = tokenResolver.resolve(token);
        Long userId = Long.valueOf(authUser.userId());

        // Make sure the user actually exists
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "User not found"
                ));

        return user.getId();
    }

    @GetMapping
    @Operation(summary = "Get current user's profile + settings")
    public ProfileResponse getProfile(@RequestHeader("Authorization") String authHeader) {
        Long userId = getCurrentUserId(authHeader);
        return profileService.getProfile(userId);
    }

    @PutMapping
    @Operation(summary = "Update current user's profile + settings")
    public ProfileResponse updateProfile(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody ProfileRequest request
    ) {
        Long userId = getCurrentUserId(authHeader);
        return profileService.updateProfile(userId, request);
    }
}
