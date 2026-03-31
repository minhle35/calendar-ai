package com.calendarai.repository;

import com.calendarai.entity.Attendee;
import com.calendarai.entity.Event;
import com.calendarai.entity.User;
import com.calendarai.enums.AttendeeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendeeRepository extends JpaRepository<Attendee, UUID> {

    // Fetch all attendees for an event — used to display the participants panel
    List<Attendee> findByEvent(Event event);

    // Fetch a specific user's RSVP for an event — used to show YES/NO/MAYBE status
    Optional<Attendee> findByEventAndUser(Event event, User user);

    // Fetch all events a user has been invited to — used for the user's agenda view
    List<Attendee> findByUser(User user);

    // Fetch attendees filtered by response — e.g. count who replied YES
    List<Attendee> findByEventAndResponseStatus(Event event, AttendeeStatus responseStatus);

    // Check if a user is already an attendee before adding them again
    boolean existsByEventAndUser(Event event, User user);

    // Check if a guest email is already invited (for non-registered attendees)
    boolean existsByEventAndGuestEmail(Event event, String guestEmail);
}
