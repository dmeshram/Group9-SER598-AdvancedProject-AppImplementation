package com.greenloop.backend.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@Tag(name = "Profile", description = "User profile + settings")
public class ProfileController {

    @GetMapping
    @Operation(summary = "Get current user's profile + settings")
    public Map<String, Object> getProfile() {
        // TODO: replace this static data with a real service + DB later
        Map<String, Object> profile = new HashMap<>();
        profile.put("name", "Demo User");
        profile.put("email", "demo@example.com");
        profile.put("role", "Student");
        profile.put("organization", "Arizona State University");
        profile.put("bio", "Demo profile - replace with real data later");

        Map<String, Object> settings = new HashMap<>();
        settings.put("theme", "light");
        settings.put("emailNotifications", true);
        settings.put("smsNotifications", false);
        settings.put("newsletter", true);
        settings.put("language", "en");

        Map<String, Object> response = new HashMap<>();
        response.put("profile", profile);
        response.put("settings", settings);

        return response;
    }

    @PutMapping
    @Operation(summary = "Update current user's profile + settings")
    public Map<String, Object> updateProfile(@RequestBody Map<String, Object> request) {
        // TODO: Create Profile Service for actual API calls to the database.
        return request;
    }
}
