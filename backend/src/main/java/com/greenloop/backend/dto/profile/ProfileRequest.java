package com.greenloop.backend.dto.profile;

public record ProfileRequest(
        ProfileDto profile,
        SettingsDto settings
) {}
