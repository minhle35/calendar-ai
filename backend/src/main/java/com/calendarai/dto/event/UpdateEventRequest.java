package com.calendarai.dto.event;

import com.calendarai.enums.EventStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record UpdateEventRequest(
        @NotBlank @Size(max = 255) String title,
        @Size(max = 2000) String description,
        @Size(max = 500) String location,
        @NotNull LocalDateTime startTime,
        @NotNull LocalDateTime endTime,
        boolean isRecurring,
        String recurrenceRule,
        @NotNull EventStatus status
) {}
