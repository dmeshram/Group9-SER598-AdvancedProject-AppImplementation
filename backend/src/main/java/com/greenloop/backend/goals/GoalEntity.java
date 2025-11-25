package com.greenloop.backend.goals;

import com.greenloop.backend.user.UserEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "goals")
public class GoalEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 2000)
    private String description;

    private int required;
    private String icon;
    private boolean systemDefined;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_user_id")
    private UserEntity ownerUser;   // null for system-defined goals

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public int getRequired() { return required; }
    public void setRequired(int required) { this.required = required; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public boolean isSystemDefined() { return systemDefined; }
    public void setSystemDefined(boolean systemDefined) { this.systemDefined = systemDefined; }

    public UserEntity getOwnerUser() { return ownerUser; }
    public void setOwnerUser(UserEntity ownerUser) { this.ownerUser = ownerUser; }
}
