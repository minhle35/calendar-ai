package com.calendarai.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import com.calendarai.enums.PermissionLevel;
import com.fasterxml.uuid.Generators;
import com.fasterxml.uuid.impl.TimeBasedEpochGenerator;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "permissions", indexes = {
        @Index(name = "idx_permissions_calendar_id", columnList = "calendar_id"),
        @Index(name = "idx_permissions_user_id",     columnList = "user_id")
})
@Getter @Setter @NoArgsConstructor
public class Permission {

    private static final TimeBasedEpochGenerator UUID_GENERATOR =
            Generators.timeBasedEpochGenerator();

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id = UUID_GENERATOR.generate();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "calendar_id", nullable = false)
    private Calendar calendar;

    // Nullable: null means this permission applies to all authenticated users
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "level", nullable = false)
    private PermissionLevel level;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Null means the permission never expires
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Permission(Calendar calendar, User user, PermissionLevel level, LocalDateTime expiresAt) {
        this.calendar = calendar;
        this.user = user;
        this.level = level;
        this.expiresAt = expiresAt;
    }
}
