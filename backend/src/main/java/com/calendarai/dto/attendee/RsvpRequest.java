package com.calendarai.dto.attendee;

import com.calendarai.enums.AttendeeStatus;
import jakarta.validation.constraints.NotNull;

// Payload for the YES / NO / MAYBE reply buttons on the dashboard
public record RsvpRequest(
        @NotNull AttendeeStatus responseStatus
) {}
