package com.calendarai.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import com.calendarai.enums.EventStatus;
import com.fasterxml.uuid.Generators;
import com.fasterxml.uuid.impl.TimeBasedEpochGenerator;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "events", indexes = {
        @Index(name = "idx_events_calendar_id", columnList = "calendar_id"),
        @Index(name = "idx_events_start_time",  columnList = "start_time"),
        @Index(name = "idx_events_created_by",  columnList = "created_by_id")
})
@Getter @Setter @NoArgsConstructor
public class Event {

    private static final TimeBasedEpochGenerator UUID_GENERATOR =
            Generators.timeBasedEpochGenerator();

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id = UUID_GENERATOR.generate();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "calendar_id", nullable = false)
    private Calendar calendar;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "location")
    private String location;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(name = "is_recurring", nullable = false)
    private boolean isRecurring = false;

    // iCal RRULE format e.g. "FREQ=WEEKLY;BYDAY=MO,WE,FR"
    @Column(name = "recurrence_rule")
    private String recurrenceRule;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private EventStatus status = EventStatus.DRAFT;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Event(Calendar calendar, String title, String description, String location,
                 LocalDateTime startTime, LocalDateTime endTime, User createdBy) {
        this.calendar = calendar;
        this.title = title;
        this.description = description;
        this.location = location;
        this.startTime = startTime;
        this.endTime = endTime;
        this.createdBy = createdBy;
    }
}
