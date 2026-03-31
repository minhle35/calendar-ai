package com.calendarai.dto.attendee;

import com.calendarai.entity.Attendee;
import com.calendarai.enums.AttendeeRole;
import com.calendarai.enums.AttendeeStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record AttendeeResponse(
        UUID id,
        UUID eventId,
        // Null if the attendee is a guest (email-only, no account)
        UUID userId,
        String displayName,
        String email,
        AttendeeRole role,
        AttendeeStatus responseStatus,
        LocalDateTime responseDate
) {
    public static AttendeeResponse from(Attendee attendee) {
        String displayName = attendee.getUser() != null
                ? attendee.getUser().getFirstName() + " " + attendee.getUser().getLastName()
                : attendee.getGuestEmail();

        String email = attendee.getUser() != null
                ? attendee.getUser().getEmail()
                : attendee.getGuestEmail();

        return new AttendeeResponse(
                attendee.getId(),
                attendee.getEvent().getId(),
                attendee.getUser() != null ? attendee.getUser().getId() : null,
                displayName,
                email,
                attendee.getRole(),
                attendee.getResponseStatus(),
                attendee.getResponseDate()
        );
    }
}
