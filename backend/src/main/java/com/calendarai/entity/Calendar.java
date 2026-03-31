package com.calendarai.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import com.fasterxml.uuid.Generators;
import com.fasterxml.uuid.impl.TimeBasedEpochGenerator;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "calendars")
@Getter @Setter @NoArgsConstructor
public class Calendar {

    private static final TimeBasedEpochGenerator UUID_GENERATOR =
            Generators.timeBasedEpochGenerator();

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id = UUID_GENERATOR.generate();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User owner;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    // Stored as a hex color code e.g. "#4A90E2"
    @Column(name = "color", length = 7)
    private String color = "#4A90E2";

    @Column(name = "is_default", nullable = false)
    private boolean isDefault = false;

    @Column(name = "is_public", nullable = false)
    private boolean isPublic = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Calendar(User owner, String name, String description, String color, boolean isDefault, boolean isPublic) {
        this.owner = owner;
        this.name = name;
        this.description = description;
        this.color = color;
        this.isDefault = isDefault;
        this.isPublic = isPublic;
    }
}
