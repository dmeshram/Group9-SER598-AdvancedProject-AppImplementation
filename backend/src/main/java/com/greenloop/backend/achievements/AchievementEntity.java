package com.greenloop.backend.achievements;

import jakarta.persistence.*;

@Entity
@Table(name = "achievements_master")
public class AchievementEntity {

    @Id
    private String id; 

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(nullable = false)
    private double required;

    @Column(nullable = false)
    private String unit;

    @Column(nullable = false)
    private String activityType; 

    public AchievementEntity() {
    }

    
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public double getRequired() {
        return required;
    }

    public void setRequired(double required) {
        this.required = required;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public String getActivityType() {
        return activityType;
    }

    public void setActivityType(String activityType) {
        this.activityType = activityType;
    }
}
