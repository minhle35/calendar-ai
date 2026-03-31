package com.calendarai.config;

import com.calendarai.entity.Calendar;
import com.calendarai.entity.User;
import com.calendarai.repository.CalendarRepository;
import com.calendarai.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

// Runs once after the application context is fully started.
// Only active when the "dev" profile is active (or no profile — default).
// Skipped in production via @Profile.
@Component
@Profile("!prod")
public class DataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final CalendarRepository calendarRepository;

    public DataInitializer(UserRepository userRepository, CalendarRepository calendarRepository) {
        this.userRepository = userRepository;
        this.calendarRepository = calendarRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.count() > 0) {
            log.info("Seed data already present — skipping.");
            return;
        }

        log.info("Seeding development data...");

        // ── Users ──────────────────────────────────────────────────────────────
        // Passwords are placeholder hashes — replace with real bcrypt in auth step
        User alice   = userRepository.save(new User("Alice",   "Smith",   "alice@example.com",   "$2a$12$placeholder_hash_alice"));
        User bob     = userRepository.save(new User("Bob",     "Johnson", "bob@example.com",     "$2a$12$placeholder_hash_bob"));
        User charlie = userRepository.save(new User("Charlie", "Lee",     "charlie@example.com", "$2a$12$placeholder_hash_charlie"));

        alice.setTimezone("Australia/Sydney");
        bob.setTimezone("America/New_York");
        charlie.setTimezone("Europe/London");
        userRepository.save(alice);
        userRepository.save(bob);
        userRepository.save(charlie);

        // ── Alice's calendars ──────────────────────────────────────────────────
        calendarRepository.save(new Calendar(alice,   "Personal", "Alice personal calendar", "#4A90E2", true,  false));
        calendarRepository.save(new Calendar(alice,   "Work",     "Alice work calendar",     "#E24A4A", false, false));
        calendarRepository.save(new Calendar(alice,   "Public",   "Alice public calendar",   "#4AE27A", false, true));

        // ── Bob's calendars ────────────────────────────────────────────────────
        calendarRepository.save(new Calendar(bob,     "Personal", "Bob personal calendar",   "#9B4AE2", true,  false));
        calendarRepository.save(new Calendar(bob,     "Fitness",  "Bob gym and sports",      "#E2A84A", false, false));

        // ── Charlie's calendars ────────────────────────────────────────────────
        calendarRepository.save(new Calendar(charlie, "Personal", "Charlie personal calendar","#4AE2D4", true,  false));

        log.info("Seeded: 3 users, 6 calendars.");
    }
}
