package com.calendarai.dto.sharing;

import com.calendarai.entity.Permission;
import com.calendarai.enums.PermissionLevel;

import java.time.LocalDateTime;
import java.util.UUID;

public record PermissionResponse(
        UUID id,
        UUID calendarId,
        // Null means this permission applies to all authenticated users
        UUID userId,
        String userDisplayName,
        PermissionLevel level,
        LocalDateTime createdAt,
        LocalDateTime expiresAt
) {
    public static PermissionResponse from(Permission permission) {
        String displayName = permission.getUser() != null
                ? permission.getUser().getFirstName() + " " + permission.getUser().getLastName()
                : "All authenticated users";

        return new PermissionResponse(
                permission.getId(),
                permission.getCalendar().getId(),
                permission.getUser() != null ? permission.getUser().getId() : null,
                displayName,
                permission.getLevel(),
                permission.getCreatedAt(),
                permission.getExpiresAt()
        );
    }
}
