package com.greenloop.backend.dto.profile;

public record SettingsDto(
        String theme,
        boolean emailNotifications,
        boolean smsNotifications,
        boolean newsletter,
        String language
) {}
