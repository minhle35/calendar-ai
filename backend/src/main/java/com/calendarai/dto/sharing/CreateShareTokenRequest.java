package com.calendarai.dto.sharing;

import com.calendarai.enums.PermissionLevel;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record CreateShareTokenRequest(
        @NotNull PermissionLevel permissionLevel,
        // Null means the token never expires
        LocalDateTime expiresAt
) {}
