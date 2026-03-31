package com.calendarai.repository;

import com.calendarai.entity.Calendar;
import com.calendarai.entity.Event;
import com.calendarai.enums.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface EventRepository extends JpaRepository<Event, UUID> {

    // Fetch all active events for a calendar (used to render the calendar dashboard)
    List<Event> findByCalendarAndDeletedAtIsNull(Calendar calendar);

    // Fetch events within a date range — used to render a specific month/week/day view
    @Query("SELECT e FROM Event e WHERE e.calendar = :calendar " +
           "AND e.deletedAt IS NULL " +
           "AND e.startTime >= :from " +
           "AND e.startTime < :to")
    List<Event> findByCalendarAndDateRange(
            @Param("calendar") Calendar calendar,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    // Fetch events by status — e.g. show only PUBLISHED events to attendees
    List<Event> findByCalendarAndStatusAndDeletedAtIsNull(Calendar calendar, EventStatus status);

    // Used during Google Calendar import to check for duplicates before bulk insert
    boolean existsByCalendarAndTitleAndStartTimeAndDeletedAtIsNull(
            Calendar calendar, String title, LocalDateTime startTime);
}
