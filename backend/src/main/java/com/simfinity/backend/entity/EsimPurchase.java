package com.simfinity.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "esim_purchases")
public class EsimPurchase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String planId;
    private String planName;
    private String dataGb;
    private Integer validityDays;
    private String iccid;
    private String activationCode;
    private String smdpAddress;

    @Column(length = 1024)
    private String qrCodeUrl;

    private String transactionId;

    @Column(unique = true)
    private String giftToken;

    @Column(nullable = false)
    private String status = "active";

    @Column(nullable = false)
    private LocalDateTime purchasedAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getPlanId() { return planId; }
    public void setPlanId(String planId) { this.planId = planId; }

    public String getPlanName() { return planName; }
    public void setPlanName(String planName) { this.planName = planName; }

    public String getDataGb() { return dataGb; }
    public void setDataGb(String dataGb) { this.dataGb = dataGb; }

    public Integer getValidityDays() { return validityDays; }
    public void setValidityDays(Integer validityDays) { this.validityDays = validityDays; }

    public String getIccid() { return iccid; }
    public void setIccid(String iccid) { this.iccid = iccid; }

    public String getActivationCode() { return activationCode; }
    public void setActivationCode(String activationCode) { this.activationCode = activationCode; }

    public String getSmdpAddress() { return smdpAddress; }
    public void setSmdpAddress(String smdpAddress) { this.smdpAddress = smdpAddress; }

    public String getQrCodeUrl() { return qrCodeUrl; }
    public void setQrCodeUrl(String qrCodeUrl) { this.qrCodeUrl = qrCodeUrl; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public String getGiftToken() { return giftToken; }
    public void setGiftToken(String giftToken) { this.giftToken = giftToken; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getPurchasedAt() { return purchasedAt; }
    public void setPurchasedAt(LocalDateTime purchasedAt) { this.purchasedAt = purchasedAt; }
}
