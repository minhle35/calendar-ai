package com.calendarai.service;

import com.calendarai.dto.calendar.CalendarResponse;
import com.calendarai.dto.calendar.CreateCalendarRequest;
import com.calendarai.dto.calendar.UpdateCalendarRequest;
import com.calendarai.entity.Calendar;
import com.calendarai.entity.User;
import com.calendarai.exception.AccessDeniedException;
import com.calendarai.exception.ConflictException;
import com.calendarai.exception.ResourceNotFoundException;
import com.calendarai.repository.CalendarRepository;
import com.calendarai.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class CalendarService {

    private final CalendarRepository calendarRepository;
    private final UserRepository userRepository;

    public CalendarService(CalendarRepository calendarRepository, UserRepository userRepository) {
        this.calendarRepository = calendarRepository;
        this.userRepository = userRepository;
    }

    // Fetch all active calendars for the left panel
    @Transactional(readOnly = true)
    public List<CalendarResponse> getCalendarsForUser(UUID userId) {
        User owner = findUser(userId);
        return calendarRepository.findByOwnerAndDeletedAtIsNull(owner)
                .stream()
                .map(CalendarResponse::from)
                .toList();
    }

    // Fetch a single calendar — verifies the requesting user owns it
    @Transactional(readOnly = true)
    public CalendarResponse getCalendar(UUID calendarId, UUID requestingUserId) {
        Calendar calendar = findCalendar(calendarId);
        assertOwner(calendar, requestingUserId);
        return CalendarResponse.from(calendar);
    }

    public CalendarResponse createCalendar(CreateCalendarRequest request, UUID ownerId) {
        User owner = findUser(ownerId);

        // If this calendar is marked as default, unset the current default first
        if (request.isDefault()) {
            clearDefaultCalendar(owner);
        }

        Calendar calendar = new Calendar(
                owner,
                request.name(),
                request.description(),
                request.color() != null ? request.color() : "#4A90E2",
                request.isDefault(),
                request.isPublic()
        );

        return CalendarResponse.from(calendarRepository.save(calendar));
    }

    public CalendarResponse updateCalendar(UUID calendarId, UpdateCalendarRequest request, UUID requestingUserId) {
        Calendar calendar = findCalendar(calendarId);
        assertOwner(calendar, requestingUserId);

        calendar.setName(request.name());
        calendar.setDescription(request.description());
        if (request.color() != null) {
            calendar.setColor(request.color());
        }
        calendar.setPublic(request.isPublic());

        return CalendarResponse.from(calendarRepository.save(calendar));
    }

    // Soft delete — sets deletedAt instead of removing the row
    public void deleteCalendar(UUID calendarId, UUID requestingUserId) {
        Calendar calendar = findCalendar(calendarId);
        assertOwner(calendar, requestingUserId);

        if (calendar.isDefault()) {
            throw new ConflictException("Cannot delete the default calendar. Set another calendar as default first.");
        }

        calendar.setDeletedAt(LocalDateTime.now());
        calendarRepository.save(calendar);
    }

    // Mark a calendar as the user's default — unsets the previous default
    public CalendarResponse setDefaultCalendar(UUID calendarId, UUID requestingUserId) {
        Calendar calendar = findCalendar(calendarId);
        assertOwner(calendar, requestingUserId);

        User owner = calendar.getOwner();
        clearDefaultCalendar(owner);

        calendar.setDefault(true);
        return CalendarResponse.from(calendarRepository.save(calendar));
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    private User findUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
    }

    private Calendar findCalendar(UUID calendarId) {
        return calendarRepository.findById(calendarId)
                .filter(c -> c.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("Calendar", calendarId));
    }

    private void assertOwner(Calendar calendar, UUID userId) {
        if (!calendar.getOwner().getId().equals(userId)) {
            throw new AccessDeniedException("You do not have permission to access this calendar");
        }
    }

    private void clearDefaultCalendar(User owner) {
        calendarRepository.findByOwnerAndIsDefaultTrueAndDeletedAtIsNull(owner)
                .ifPresent(existing -> {
                    existing.setDefault(false);
                    calendarRepository.save(existing);
                });
    }
}
