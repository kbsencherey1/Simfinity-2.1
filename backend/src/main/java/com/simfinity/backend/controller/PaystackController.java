package com.simfinity.backend.controller;

import com.simfinity.backend.entity.EsimPurchase;
import com.simfinity.backend.entity.PaymentRecord;
import com.simfinity.backend.entity.ReferralReward;
import com.simfinity.backend.entity.User;
import com.simfinity.backend.repository.EsimPurchaseRepository;
import com.simfinity.backend.repository.PaymentRepository;
import com.simfinity.backend.repository.ReferralRewardRepository;
import com.simfinity.backend.repository.UserRepository;
import com.simfinity.backend.service.PaystackService;
import com.simfinity.backend.service.ZenditService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/paystack")
public class PaystackController {

    private static final Logger log = LoggerFactory.getLogger(PaystackController.class);

    private final PaystackService paystackService;
    private final ZenditService zenditService;
    private final UserRepository userRepository;
    private final EsimPurchaseRepository esimPurchaseRepository;
    private final PaymentRepository paymentRepository;
    private final ReferralRewardRepository referralRewardRepository;

    public PaystackController(PaystackService paystackService,
                               ZenditService zenditService,
                               UserRepository userRepository,
                               EsimPurchaseRepository esimPurchaseRepository,
                               PaymentRepository paymentRepository,
                               ReferralRewardRepository referralRewardRepository) {
        this.paystackService = paystackService;
        this.zenditService = zenditService;
        this.userRepository = userRepository;
        this.esimPurchaseRepository = esimPurchaseRepository;
        this.paymentRepository = paymentRepository;
        this.referralRewardRepository = referralRewardRepository;
    }

    @PostMapping("/initialize")
    public ResponseEntity<Map<String, Object>> initialize(@RequestBody Map<String, Object> body,
                                                           Authentication auth) {
        String email = auth != null ? auth.getName() : (String) body.get("email");
        Object amountObj = body.get("amountGhs");
        String planId = (String) body.getOrDefault("planId", "gold_coast_monthly");

        if (email == null || amountObj == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and amountGhs are required."));
        }
        double amountGhs = amountObj instanceof Number n ? n.doubleValue()
            : Double.parseDouble(amountObj.toString());

        // A referral discount can only be applied by its owner — requires auth, not just an email match.
        Object rewardIdObj = body.get("rewardId");
        if (rewardIdObj != null && auth != null) {
            Long rewardId = rewardIdObj instanceof Number n ? n.longValue() : Long.parseLong(rewardIdObj.toString());
            Optional<User> userOpt = userRepository.findByEmail(auth.getName());
            if (userOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "User not found."));

            Optional<ReferralReward> rewardOpt = referralRewardRepository.findByIdAndUser(rewardId, userOpt.get());
            if (rewardOpt.isEmpty() || !"UNCLAIMED".equals(rewardOpt.get().getStatus())) {
                return ResponseEntity.badRequest().body(Map.of("error", "This reward is not available."));
            }
            double discountPercent = rewardOpt.get().getDiscountPercent();
            amountGhs = Math.round(amountGhs * (1 - discountPercent / 100.0) * 100.0) / 100.0;
        }

        return ResponseEntity.ok(paystackService.initializeTransaction(email, amountGhs, planId));
    }

    @PostMapping("/verify/{reference}")
    public ResponseEntity<Map<String, Object>> verify(
            @PathVariable String reference,
            @RequestBody(required = false) Map<String, Object> body,
            Authentication auth) {

        String planId = body != null ? (String) body.getOrDefault("planId", "gold_coast_monthly")
            : "gold_coast_monthly";
        String targetIccid = body != null ? (String) body.get("targetIccid") : null;

        // For top-ups: verify payment, then call the top-up endpoint (not new provision)
        Map<String, Object> result;
        if (targetIccid != null && !targetIccid.isBlank()) {
            result = paystackService.verifyPaymentOnly(reference);
            if (!result.containsKey("error")) {
                Map<String, Object> topUpResult = zenditService.topUpEsim(targetIccid, reference, planId);
                result = Map.of(
                    "success", true,
                    "reference", reference,
                    "paymentStatus", "success",
                    "isTopUp", true,
                    "esim", topUpResult
                );
            }
        } else {
            result = paystackService.verifyTransaction(reference, planId);
        }

        if (result.containsKey("error")) {
            return ResponseEntity.badRequest().body(result);
        }

        if (auth != null) {
            final Map<String, Object> finalResult = result;
            userRepository.findByEmail(auth.getName()).ifPresent(user -> {
                try {
                    if (!paymentRepository.existsByReference(reference)) {
                        PaymentRecord payment = new PaymentRecord();
                        payment.setUser(user);
                        payment.setReference(reference);
                        payment.setPlanId(planId);
                        payment.setStatus("success");
                        if (body != null) {
                            if (body.get("amountGhs") instanceof Number n) payment.setAmountGhs(n.doubleValue());
                            if (body.get("planName") instanceof String pn) payment.setPlanName(pn);
                        }
                        paymentRepository.save(payment);
                    }

                    @SuppressWarnings("unchecked")
                    Map<String, Object> esimData = (Map<String, Object>) finalResult.get("esim");
                    boolean isTopUpPurchase = esimData != null && Boolean.TRUE.equals(esimData.get("isTopUp"));
                    boolean wasFirstActivation = !esimPurchaseRepository.existsByUser(user);

                    EsimPurchase purchase = new EsimPurchase();
                    purchase.setUser(user);
                    purchase.setPlanId(planId);
                    if (body != null) {
                        purchase.setPlanName((String) body.get("planName"));
                        purchase.setDataGb((String) body.get("dataGb"));
                        if (body.get("validityDays") instanceof Number n) purchase.setValidityDays(n.intValue());
                    }
                    purchase.setTransactionId(reference);
                    if (esimData != null) {
                        String iccid = (String) esimData.get("iccid");
                        purchase.setIccid(iccid);
                        // For top-ups, ICCID is the target; activation fields come from the existing eSIM
                        if (!isTopUpPurchase) {
                            purchase.setActivationCode((String) esimData.get("activationCode"));
                            purchase.setSmdpAddress((String) esimData.get("smdpAddress"));
                            purchase.setQrCodeUrl((String) esimData.get("qrCodeUrl"));
                        }
                    }
                    esimPurchaseRepository.save(purchase);

                    // Referral reward: first-ever activation (not a top-up) by someone who
                    // signed up with a referral code grants the referrer a redeemable discount.
                    if (!isTopUpPurchase && wasFirstActivation && user.getReferredById() != null
                            && !referralRewardRepository.existsByReferredUser(user)) {
                        userRepository.findById(user.getReferredById()).ifPresent(referrer -> {
                            ReferralReward reward = new ReferralReward();
                            reward.setUser(referrer);
                            reward.setReferredUser(user);
                            referralRewardRepository.save(reward);
                        });
                    }

                    // If this purchase applied a referral discount, mark it consumed now that
                    // payment has actually succeeded (not at /initialize, in case it's abandoned).
                    Object rewardIdObj = body != null ? body.get("rewardId") : null;
                    if (rewardIdObj != null) {
                        Long rewardId = rewardIdObj instanceof Number n ? n.longValue() : Long.parseLong(rewardIdObj.toString());
                        referralRewardRepository.findByIdAndUser(rewardId, user).ifPresent(reward -> {
                            if ("UNCLAIMED".equals(reward.getStatus())) {
                                reward.setStatus("REDEEMED");
                                reward.setRedeemedAt(LocalDateTime.now());
                                reward.setRedeemedReference(reference);
                                referralRewardRepository.save(reward);
                            }
                        });
                    }
                } catch (Exception e) {
                    log.warn("[Paystack] Failed to save purchase records: {}", e.getMessage());
                }
            });
        }

        return ResponseEntity.ok(result);
    }
}
