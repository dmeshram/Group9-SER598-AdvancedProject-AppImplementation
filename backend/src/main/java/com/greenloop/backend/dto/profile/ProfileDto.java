package com.greenloop.backend.dto.profile;

public record ProfileDto(
        String name,
        String email,
        String role,
        String organization,
        String bio
) {}
