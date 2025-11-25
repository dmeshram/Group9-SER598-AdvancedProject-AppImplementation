package com.greenloop.backend.dto.profile;

public record ProfileResponse(
        ProfileDto profile,
        SettingsDto settings
) {}
