package com.calendarai.repository;

import com.calendarai.entity.Calendar;
import com.calendarai.entity.ShareToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ShareTokenRepository extends JpaRepository<ShareToken, UUID> {

    // Look up a calendar by its share link token — used when a recipient clicks the link
    Optional<ShareToken> findByTokenAndIsActiveTrue(String token);

    // Fetch all active share links for a calendar — shown in the sharing settings panel
    List<ShareToken> findByCalendarAndIsActiveTrue(Calendar calendar);
}
