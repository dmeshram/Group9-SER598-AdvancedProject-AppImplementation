package com.greenloop.backend.dto.profile;

public record SettingsDto(
        String theme,                 // "light", "dark", "system"
        boolean emailNotifications,
        boolean smsNotifications,
        boolean newsletter,
        String language               // e.g. "en"
) {}
