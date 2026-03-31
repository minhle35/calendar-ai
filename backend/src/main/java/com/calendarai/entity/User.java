package com.calendarai.entity;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.UUID;
import com.fasterxml.uuid.Generators;
import com.fasterxml.uuid.impl.TimeBasedEpochGenerator;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor
public class User {

    private static final TimeBasedEpochGenerator UUID_GENERATOR =
            Generators.timeBasedEpochGenerator();

    @Id
    @Column(name = "user_id", updatable = false, nullable = false)
    private UUID id = UUID_GENERATOR.generate();

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "timezone", nullable = false)
    private String timezone = "UTC";

    @Column(name = "profile_picture_url", nullable = false)
    private String profilePictureUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.profilePictureUrl == null) {
            this.profilePictureUrl = generateAvatarUrl(this.email);
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public User(String firstName, String lastName, String email, String passwordHash) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.passwordHash = passwordHash;
    }

    /*
    * Generates a Gravatar URL for the user based on their email.
    * If the email is invalid or an error occurs, it returns a default identicon URL.
    * Gravatar documentation: https://en.gravatar.com/site/implement/images/
    * .getBytes() with UTF-8 encoding ensures consistent hashing across different platforms and locales.
    * .digest() computes the MD5 hash of the normalized email, required by Gravatar
    */

    private String generateAvatarUrl(String email) {
        try {
            String normalizedEmail = email.trim().toLowerCase();
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] hash = md.digest(normalizedEmail.getBytes(StandardCharsets.UTF_8));

            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }

            return "https://www.gravatar.com/avatar/" + sb + "?d=identicon&s=128";

        } catch (NoSuchAlgorithmException e) {
            return "https://www.gravatar.com/avatar/?d=identicon&s=128";
        }
    }
}
