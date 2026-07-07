package com.simfinity.backend.repository;

import com.simfinity.backend.entity.PaymentRecord;
import com.simfinity.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<PaymentRecord, Long> {
    List<PaymentRecord> findByUserOrderByCreatedAtDesc(User user);
    boolean existsByReference(String reference);
}
