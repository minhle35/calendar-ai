package com.calendarai.dto.sharing;

import com.calendarai.entity.ShareToken;
import com.calendarai.enums.PermissionLevel;

import java.time.LocalDateTime;
import java.util.UUID;

public record ShareTokenResponse(
        UUID id,
        UUID calendarId,
        String token,
        PermissionLevel permissionLevel,
        boolean isActive,
        LocalDateTime createdAt,
        LocalDateTime expiresAt
) {
    public static ShareTokenResponse from(ShareToken shareToken) {
        return new ShareTokenResponse(
                shareToken.getId(),
                shareToken.getCalendar().getId(),
                shareToken.getToken(),
                shareToken.getPermissionLevel(),
                shareToken.isActive(),
                shareToken.getCreatedAt(),
                shareToken.getExpiresAt()
        );
    }
}
