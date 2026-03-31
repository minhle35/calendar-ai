package com.calendarai.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import com.calendarai.enums.AttendeeRole;
import com.calendarai.enums.AttendeeStatus;
import com.fasterxml.uuid.Generators;
import com.fasterxml.uuid.impl.TimeBasedEpochGenerator;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "attendees", indexes = {
        @Index(name = "idx_attendees_event_id", columnList = "event_id"),
        @Index(name = "idx_attendees_user_id",  columnList = "user_id")
})
@Getter @Setter @NoArgsConstructor
public class Attendee {

    private static final TimeBasedEpochGenerator UUID_GENERATOR =
            Generators.timeBasedEpochGenerator();

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id = UUID_GENERATOR.generate();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    // Nullable: guests invited by email only (not registered users)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // Used when the attendee is a guest without a user account
    @Column(name = "guest_email")
    private String guestEmail;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private AttendeeRole role = AttendeeRole.REQUIRED;

    // Maps to dashboard reply buttons: ACCEPTED=YES, DECLINED=NO, TENTATIVE=MAYBE
    @Enumerated(EnumType.STRING)
    @Column(name = "response_status", nullable = false)
    private AttendeeStatus responseStatus = AttendeeStatus.PENDING;

    @Column(name = "response_date")
    private LocalDateTime responseDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Constructor for registered users
    public Attendee(Event event, User user, AttendeeRole role) {
        this.event = event;
        this.user = user;
        this.role = role;
    }

    // Constructor for guest attendees (email only)
    public Attendee(Event event, String guestEmail, AttendeeRole role) {
        this.event = event;
        this.guestEmail = guestEmail;
        this.role = role;
    }
}
