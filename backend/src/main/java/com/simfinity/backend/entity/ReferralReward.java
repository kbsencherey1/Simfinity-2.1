package com.simfinity.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/** A discount earned when a referred friend activates their first eSIM plan. */
@Entity
@Table(name = "referral_rewards")
public class ReferralReward {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The referrer — the person who earns and applies this discount. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** The friend whose first activation triggered this reward. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referred_user_id", nullable = false)
    private User referredUser;

    @Column(nullable = false)
    private double discountPercent = 10.0;

    @Column(nullable = false)
    private String status = "UNCLAIMED";

    @Column(nullable = false)
    private LocalDateTime earnedAt = LocalDateTime.now();

    private LocalDateTime redeemedAt;

    /** The Paystack transaction reference the discount was applied to. */
    private String redeemedReference;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public User getReferredUser() { return referredUser; }
    public void setReferredUser(User referredUser) { this.referredUser = referredUser; }

    public double getDiscountPercent() { return discountPercent; }
    public void setDiscountPercent(double discountPercent) { this.discountPercent = discountPercent; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getEarnedAt() { return earnedAt; }
    public void setEarnedAt(LocalDateTime earnedAt) { this.earnedAt = earnedAt; }

    public LocalDateTime getRedeemedAt() { return redeemedAt; }
    public void setRedeemedAt(LocalDateTime redeemedAt) { this.redeemedAt = redeemedAt; }

    public String getRedeemedReference() { return redeemedReference; }
    public void setRedeemedReference(String redeemedReference) { this.redeemedReference = redeemedReference; }
}
