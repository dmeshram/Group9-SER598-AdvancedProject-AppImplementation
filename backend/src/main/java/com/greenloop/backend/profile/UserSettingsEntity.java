package com.greenloop.backend.profile;

import com.greenloop.backend.user.UserEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "user_settings")
public class UserSettingsEntity {

    @Id
    private Long userId;   // same as UserEntity.id

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private UserEntity user;

    private String theme;                // "light", "dark", "system"
    private boolean emailNotifications;
    private boolean smsNotifications;
    private boolean newsletter;
    private String language;            // "en"

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public UserEntity getUser() { return user; }
    public void setUser(UserEntity user) { this.user = user; }

    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }

    public boolean isEmailNotifications() { return emailNotifications; }
    public void setEmailNotifications(boolean emailNotifications) { this.emailNotifications = emailNotifications; }

    public boolean isSmsNotifications() { return smsNotifications; }
    public void setSmsNotifications(boolean smsNotifications) { this.smsNotifications = smsNotifications; }

    public boolean isNewsletter() { return newsletter; }
    public void setNewsletter(boolean newsletter) { this.newsletter = newsletter; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
}
