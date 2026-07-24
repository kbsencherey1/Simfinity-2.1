package com.simfinity.backend.repository;

import com.simfinity.backend.entity.ReferralReward;
import com.simfinity.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReferralRewardRepository extends JpaRepository<ReferralReward, Long> {
    List<ReferralReward> findByUserAndStatusOrderByEarnedAtDesc(User user, String status);
    Optional<ReferralReward> findByIdAndUser(Long id, User user);
    boolean existsByReferredUser(User referredUser);
}
