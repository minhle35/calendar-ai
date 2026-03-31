package com.calendarai.dto.user;

import com.calendarai.entity.User;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String firstName,
        String lastName,
        String email,
        String timezone,
        String profilePictureUrl,
        LocalDateTime createdAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getTimezone(),
                user.getProfilePictureUrl(),
                user.getCreatedAt()
        );
    }
}
