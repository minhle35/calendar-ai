package com.calendarai.dto.calendar;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateCalendarRequest(
        @NotBlank @Size(max = 100) String name,
        @Size(max = 500) String description,
        // Must be a valid hex color code e.g. "#4A90E2"
        @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Color must be a valid hex code e.g. #4A90E2")
        String color,
        boolean isDefault,
        boolean isPublic
) {}
