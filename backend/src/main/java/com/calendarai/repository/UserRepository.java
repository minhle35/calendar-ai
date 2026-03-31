package com.calendarai.repository;

import com.calendarai.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    // Used during login to look up a user by their email
    Optional<User> findByEmail(String email);

    // Used during registration to check if the email is already taken
    boolean existsByEmail(String email);
}
