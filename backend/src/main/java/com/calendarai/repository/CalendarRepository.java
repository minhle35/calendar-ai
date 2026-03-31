package com.calendarai.repository;

import com.calendarai.entity.Calendar;
import com.calendarai.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CalendarRepository extends JpaRepository<Calendar, UUID> {

    // Fetch all active calendars for the left panel (excludes soft-deleted)
    List<Calendar> findByOwnerAndDeletedAtIsNull(User owner);

    // Find the user's default calendar (used when importing from Google Calendar)
    Optional<Calendar> findByOwnerAndIsDefaultTrueAndDeletedAtIsNull(User owner);

    // Check if a user owns a specific calendar (used for authorization)
    boolean existsByIdAndOwner(UUID id, User owner);
}
