package com.calendarai.dto.event;

import com.calendarai.entity.Event;
import com.calendarai.enums.EventStatus;

import java.time.LocalDateTime;
import java.util.UUID;

// Lightweight projection used for month/week/day calendar grid view.
// Omits description and recurrence details to keep the payload small.
public record EventSummaryResponse(
        UUID id,
        UUID calendarId,
        String title,
        String location,
        LocalDateTime startTime,
        LocalDateTime endTime,
        EventStatus status
) {
    public static EventSummaryResponse from(Event event) {
        return new EventSummaryResponse(
                event.getId(),
                event.getCalendar().getId(),
                event.getTitle(),
                event.getLocation(),
                event.getStartTime(),
                event.getEndTime(),
                event.getStatus()
        );
    }
}
