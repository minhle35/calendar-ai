package com.calendarai.repository;

import com.calendarai.entity.Calendar;
import com.calendarai.entity.Permission;
import com.calendarai.entity.User;
import com.calendarai.enums.PermissionLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, UUID> {

    // Fetch all permissions for a calendar — used to display the sharing settings panel
    List<Permission> findByCalendar(Calendar calendar);

    // Fetch a specific user's permission on a calendar
    Optional<Permission> findByCalendarAndUser(Calendar calendar, User user);

    // Check if a user has at least a given level — used for authorization checks
    @Query("SELECT COUNT(p) > 0 FROM Permission p WHERE p.calendar = :calendar " +
           "AND p.user = :user " +
           "AND p.level IN :levels " +
           "AND (p.expiresAt IS NULL OR p.expiresAt > :now)")
    boolean hasPermission(
            @Param("calendar") Calendar calendar,
            @Param("user") User user,
            @Param("levels") List<PermissionLevel> levels,
            @Param("now") LocalDateTime now);
}
