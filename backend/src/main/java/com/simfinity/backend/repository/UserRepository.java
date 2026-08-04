package com.simfinity.backend.repository;

import com.simfinity.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByReferralCode(String referralCode);
    List<User> findByReferredById(Long referredById);
    Optional<User> findByResetToken(String resetToken);
}
