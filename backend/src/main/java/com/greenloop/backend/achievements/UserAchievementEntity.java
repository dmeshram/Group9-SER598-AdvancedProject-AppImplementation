package com.greenloop.backend.achievements;

import com.greenloop.backend.user.UserEntity;
import jakarta.persistence.*;

import java.io.Serializable;
import java.time.OffsetDateTime;

@Entity
@Table(name = "user_achievements")
public class UserAchievementEntity {

    @EmbeddedId
    private UserAchievementId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("achievementId")
    private AchievementEntity achievement;

    @Column(nullable = false)
    private double progress = 0.0;

    private OffsetDateTime unlockedAt;

    public UserAchievementEntity() {
    }

    // getters & setters

    public UserAchievementId getId() {
        return id;
    }

    public void setId(UserAchievementId id) {
        this.id = id;
    }

    public UserEntity getUser() {
        return user;
    }

    public void setUser(UserEntity user) {
        this.user = user;
    }

    public AchievementEntity getAchievement() {
        return achievement;
    }

    public void setAchievement(AchievementEntity achievement) {
        this.achievement = achievement;
    }

    public double getProgress() {
        return progress;
    }

    public void setProgress(double progress) {
        this.progress = progress;
    }

    public OffsetDateTime getUnlockedAt() {
        return unlockedAt;
    }

    public void setUnlockedAt(OffsetDateTime unlockedAt) {
        this.unlockedAt = unlockedAt;
    }

    // ----- Embedded ID -----
    @Embeddable
    public static class UserAchievementId implements Serializable {

        private Long userId;
        private String achievementId;

        public UserAchievementId() {
        }

        public UserAchievementId(Long userId, String achievementId) {
            this.userId = userId;
            this.achievementId = achievementId;
        }

        // getters/setters

        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }

        public String getAchievementId() {
            return achievementId;
        }

        public void setAchievementId(String achievementId) {
            this.achievementId = achievementId;
        }

        // equals/hashCode REQUIRED for JPA identity
        @Override
        public boolean equals(Object o) {
            if (this == o)
                return true;
            if (!(o instanceof UserAchievementId))
                return false;
            UserAchievementId that = (UserAchievementId) o;
            return userId.equals(that.userId) &&
                    achievementId.equals(that.achievementId);
        }

        @Override
        public int hashCode() {
            return userId.hashCode() + achievementId.hashCode();
        }
    }
}
