package com.calendarai.dto.event;

import com.calendarai.entity.Event;
import com.calendarai.enums.EventStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record EventResponse(
        UUID id,
        UUID calendarId,
        String title,
        String description,
        String location,
        LocalDateTime startTime,
        LocalDateTime endTime,
        boolean isRecurring,
        String recurrenceRule,
        EventStatus status,
        UUID createdById,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static EventResponse from(Event event) {
        return new EventResponse(
                event.getId(),
                event.getCalendar().getId(),
                event.getTitle(),
                event.getDescription(),
                event.getLocation(),
                event.getStartTime(),
                event.getEndTime(),
                event.isRecurring(),
                event.getRecurrenceRule(),
                event.getStatus(),
                event.getCreatedBy().getId(),
                event.getCreatedAt(),
                event.getUpdatedAt()
        );
    }
}
