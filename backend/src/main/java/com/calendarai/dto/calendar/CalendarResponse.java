package com.calendarai.dto.calendar;

import com.calendarai.entity.Calendar;

import java.time.LocalDateTime;
import java.util.UUID;

public record CalendarResponse(
        UUID id,
        String name,
        String description,
        String color,
        boolean isDefault,
        boolean isPublic,
        UUID ownerId,
        LocalDateTime createdAt
) {
    public static CalendarResponse from(Calendar calendar) {
        return new CalendarResponse(
                calendar.getId(),
                calendar.getName(),
                calendar.getDescription(),
                calendar.getColor(),
                calendar.isDefault(),
                calendar.isPublic(),
                calendar.getOwner().getId(),
                calendar.getCreatedAt()
        );
    }
}
