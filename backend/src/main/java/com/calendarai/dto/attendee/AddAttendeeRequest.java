package com.calendarai.dto.attendee;

import com.calendarai.enums.AttendeeRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AddAttendeeRequest(
        // Provide userId for registered users OR email for guest invites — not both
        UUID userId,
        @Email String guestEmail,
        @NotNull AttendeeRole role
) {}
