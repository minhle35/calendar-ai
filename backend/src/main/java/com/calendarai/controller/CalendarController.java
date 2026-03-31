package com.calendarai.controller;

import com.calendarai.dto.calendar.CalendarResponse;
import com.calendarai.dto.calendar.CreateCalendarRequest;
import com.calendarai.dto.calendar.UpdateCalendarRequest;
import com.calendarai.service.CalendarService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/calendars")
public class CalendarController {

    private final CalendarService calendarService;

    public CalendarController(CalendarService calendarService) {
        this.calendarService = calendarService;
    }

    // GET /api/v1/calendars?userId={userId}
    // Returns all calendars for the left panel
    // TODO: replace userId param with JWT principal once auth is added
    @GetMapping
    public ResponseEntity<List<CalendarResponse>> getCalendars(@RequestParam UUID userId) {
        return ResponseEntity.ok(calendarService.getCalendarsForUser(userId));
    }

    // GET /api/v1/calendars/{id}?userId={userId}
    @GetMapping("/{id}")
    public ResponseEntity<CalendarResponse> getCalendar(
            @PathVariable UUID id,
            @RequestParam UUID userId) {
        return ResponseEntity.ok(calendarService.getCalendar(id, userId));
    }

    // POST /api/v1/calendars?userId={userId}
    @PostMapping
    public ResponseEntity<CalendarResponse> createCalendar(
            @Valid @RequestBody CreateCalendarRequest request,
            @RequestParam UUID userId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(calendarService.createCalendar(request, userId));
    }

    // PUT /api/v1/calendars/{id}?userId={userId}
    @PutMapping("/{id}")
    public ResponseEntity<CalendarResponse> updateCalendar(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateCalendarRequest request,
            @RequestParam UUID userId) {
        return ResponseEntity.ok(calendarService.updateCalendar(id, request, userId));
    }

    // DELETE /api/v1/calendars/{id}?userId={userId}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCalendar(
            @PathVariable UUID id,
            @RequestParam UUID userId) {
        calendarService.deleteCalendar(id, userId);
        return ResponseEntity.noContent().build();
    }

    // PATCH /api/v1/calendars/{id}/default?userId={userId}
    @PatchMapping("/{id}/default")
    public ResponseEntity<CalendarResponse> setDefault(
            @PathVariable UUID id,
            @RequestParam UUID userId) {
        return ResponseEntity.ok(calendarService.setDefaultCalendar(id, userId));
    }
}
