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
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        ProfileDto p = request.profile();
        user.setName(p.name());
        user.setRole(p.role());
        user.setOrganization(p.organization());
        user.setBio(p.bio());
        userRepository.save(user);

        UserSettingsEntity settings = settingsRepository.findById(userId)
                .orElseGet(() -> {
                    UserSettingsEntity s = new UserSettingsEntity();
                    s.setUser(user);
                    s.setUserId(user.getId());
                    return s;
                });

        SettingsDto sDto = request.settings();
        settings.setTheme(sDto.theme());
        settings.setEmailNotifications(sDto.emailNotifications());
        settings.setSmsNotifications(sDto.smsNotifications());
        settings.setNewsletter(sDto.newsletter());
        settings.setLanguage(sDto.language());
        settingsRepository.save(settings);

        return new ProfileResponse(p, sDto);
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
