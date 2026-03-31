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
@Table(name = "share_tokens", indexes = {
        @Index(name = "idx_share_tokens_token",       columnList = "token", unique = true),
        @Index(name = "idx_share_tokens_calendar_id", columnList = "calendar_id")
})
@Getter @Setter @NoArgsConstructor
public class ShareToken {

    private static final TimeBasedEpochGenerator UUID_GENERATOR =
            Generators.timeBasedEpochGenerator();

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id = UUID_GENERATOR.generate();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "calendar_id", nullable = false)
    private Calendar calendar;

    // URL-safe token sent to recipients e.g. via email link
    @Column(name = "token", nullable = false, unique = true)
    private String token;

    @Enumerated(EnumType.STRING)
    @Column(name = "permission_level", nullable = false)
    private PermissionLevel permissionLevel;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Null means the token never expires
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public ShareToken(Calendar calendar, String token, PermissionLevel permissionLevel, LocalDateTime expiresAt) {
        this.calendar = calendar;
        this.token = token;
        this.permissionLevel = permissionLevel;
        this.expiresAt = expiresAt;
    }
}
