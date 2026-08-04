package com.simfinity.backend.repository;

import com.simfinity.backend.entity.EsimPurchase;
import com.simfinity.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EsimPurchaseRepository extends JpaRepository<EsimPurchase, Long> {
    List<EsimPurchase> findByUserOrderByPurchasedAtDesc(User user);
    Optional<EsimPurchase> findByGiftToken(String giftToken);
    Optional<EsimPurchase> findByIdAndUser(Long id, User user);
    boolean existsByUser(User user);
    boolean existsByTransactionId(String transactionId);
    Optional<EsimPurchase> findByTransactionId(String transactionId);
}
