package com.greenloop.backend.profile;

import com.greenloop.backend.dto.profile.ProfileDto;
import com.greenloop.backend.dto.profile.ProfileRequest;
import com.greenloop.backend.dto.profile.ProfileResponse;
import com.greenloop.backend.dto.profile.SettingsDto;
import com.greenloop.backend.user.UserEntity;
import com.greenloop.backend.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProfileService {

    private final UserRepository userRepository;
    private final UserSettingsRepository settingsRepository;

    public ProfileService(UserRepository userRepository,
                          UserSettingsRepository settingsRepository) {
        this.userRepository = userRepository;
        this.settingsRepository = settingsRepository;
    }

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        UserSettingsEntity settings = settingsRepository.findById(userId)
                .orElseGet(() -> defaultSettings(user));

        ProfileDto profileDto = new ProfileDto(
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getOrganization(),
                user.getBio()
        );

        SettingsDto settingsDto = new SettingsDto(
                settings.getTheme(),
                settings.isEmailNotifications(),
                settings.isSmsNotifications(),
                settings.isNewsletter(),
                settings.getLanguage()
        );

        return new ProfileResponse(profileDto, settingsDto);
    }

    @Transactional
    public ProfileResponse updateProfile(Long userId, ProfileRequest request) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "User not found: " + userId));
        var profileDto = request.profile();
        if (profileDto != null) {
            user.setName(profileDto.name());
            user.setEmail(profileDto.email());
            user.setRole(profileDto.role());
            user.setOrganization(profileDto.organization());
            user.setBio(profileDto.bio());
        }

        userRepository.save(user);

        var settingsDto = request.settings();
        UserSettingsEntity settings = settingsRepository
                .findByUserId(userId)
                .orElseGet(() -> {
                    UserSettingsEntity s = new UserSettingsEntity();
                    s.setUser(user);
                    return s;
                });

        if (settingsDto != null) {
            settings.setTheme(settingsDto.theme());
            settings.setEmailNotifications(settingsDto.emailNotifications());
            settings.setSmsNotifications(settingsDto.smsNotifications());
            settings.setNewsletter(settingsDto.newsletter());
            settings.setLanguage(settingsDto.language());
        }

        settingsRepository.save(settings);

        return new ProfileResponse(profileDto, settingsDto);
}

    private UserSettingsEntity defaultSettings(UserEntity user) {
        UserSettingsEntity s = new UserSettingsEntity();
        s.setUser(user);
        s.setUserId(user.getId());
        s.setTheme("light");
        s.setEmailNotifications(true);
        s.setSmsNotifications(false);
        s.setNewsletter(true);
        s.setLanguage("en");
        return s;
    }
}
