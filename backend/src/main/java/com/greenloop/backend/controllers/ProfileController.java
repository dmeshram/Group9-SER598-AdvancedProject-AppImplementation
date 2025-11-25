package com.greenloop.backend.controllers;

import com.greenloop.backend.dto.profile.ProfileRequest;
import com.greenloop.backend.dto.profile.ProfileResponse;
import com.greenloop.backend.profile.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@Tag(name = "Profile", description = "User profile + settings")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    // TODO: replace this with JWT-based user id via AuthTokenResolver
    private Long getCurrentUserId() {
        return 1L;
    }

    @GetMapping
    @Operation(summary = "Get current user's profile + settings")
    public ProfileResponse getProfile() {
        return profileService.getProfile(getCurrentUserId());
    }

    @PutMapping
    @Operation(summary = "Update current user's profile + settings")
    public ProfileResponse updateProfile(@RequestBody ProfileRequest request) {
        return profileService.updateProfile(getCurrentUserId(), request);
    }
}
