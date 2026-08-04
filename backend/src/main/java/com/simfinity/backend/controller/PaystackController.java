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
import com.simfinity.backend.service.RedisCacheHelper;
import com.simfinity.backend.service.ZenditService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/paystack")
public class PaystackController {

    private static final Logger log = LoggerFactory.getLogger(PaystackController.class);

    // How long a single in-flight verify (Paystack check + Zendit provisioning) is allowed to
    // hold its claim before another request is allowed to retry it.
    private static final Duration VERIFY_LOCK_TTL = Duration.ofSeconds(60);
    private static final Duration VERIFIED_RESULT_TTL = Duration.ofDays(7);

    private final PaystackService paystackService;
    private final ZenditService zenditService;
    private final UserRepository userRepository;
    private final EsimPurchaseRepository esimPurchaseRepository;
    private final PaymentRepository paymentRepository;
    private final ReferralRewardRepository referralRewardRepository;
    private final RedisCacheHelper redisCache;

    public PaystackController(PaystackService paystackService,
                               ZenditService zenditService,
                               UserRepository userRepository,
                               EsimPurchaseRepository esimPurchaseRepository,
                               PaymentRepository paymentRepository,
                               ReferralRewardRepository referralRewardRepository,
                               RedisCacheHelper redisCache) {
        this.paystackService = paystackService;
        this.zenditService = zenditService;
        this.userRepository = userRepository;
        this.esimPurchaseRepository = esimPurchaseRepository;
        this.paymentRepository = paymentRepository;
        this.referralRewardRepository = referralRewardRepository;
        this.redisCache = redisCache;
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

        // The client fully controls amountGhs in this request — validate it against the plan's
        // real cached catalog price before creating a Paystack transaction for it, so a tampered
        // client can't pay a fraction of a plan's cost and still get a real eSIM provisioned.
        // Skipped only when the plan isn't cached anywhere (can't validate what we don't know).
        Double catalogPriceGhs = zenditService.findCatalogPriceGhs(planId);
        if (catalogPriceGhs != null && amountGhs < catalogPriceGhs * 0.9) {
            return ResponseEntity.badRequest().body(Map.of("error", "Amount does not match this plan's current price."));
        }

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
        boolean isTopUpRequest = targetIccid != null && !targetIccid.isBlank();

        // The mobile app polls this endpoint repeatedly to auto-close the checkout browser
        // the instant payment succeeds, so it may call us several times for the same
        // reference. Short-circuit on an already-processed one instead of re-provisioning
        // or re-topping-up with Zendit again — those are real, costly, one-shot operations.
        Optional<EsimPurchase> alreadyProcessed = esimPurchaseRepository.findByTransactionId(reference);
        Map<String, Object> result;
        if (alreadyProcessed.isPresent()) {
            EsimPurchase p = alreadyProcessed.get();
            Map<String, Object> esimData = new HashMap<>();
            esimData.put("iccid", p.getIccid());
            esimData.put("isTopUp", isTopUpRequest);
            if (!isTopUpRequest) {
                esimData.put("activationCode", p.getActivationCode());
                esimData.put("smdpAddress", p.getSmdpAddress());
                esimData.put("qrCodeUrl", p.getQrCodeUrl());
            }
            result = Map.of(
                "success", true,
                "reference", reference,
                "paymentStatus", "success",
                "isTopUp", isTopUpRequest,
                "esim", esimData
            );
        } else {
            // The check above only catches repeats *after* a logged-in purchase has been
            // persisted below — but this endpoint is intentionally open to unauthenticated
            // calls too (see /initialize's guest-checkout support), and that persistence step
            // never runs without an authenticated user. Without a guard here, an unauthenticated
            // or replayed call — or two concurrent polls racing before the DB row exists — would
            // call Zendit again and provision a second real eSIM for one payment. This Redis
            // claim covers every caller, authenticated or not, and is atomic across concurrent
            // requests, so it's the actual source of truth for "has this reference been paid out."
            String verifiedKey = "paystack:verified:" + reference;
            String lockKey = "paystack:lock:" + reference;
            Map<String, Object> cached = redisCache.get(verifiedKey);
            if (cached != null) {
                result = cached;
            } else if (redisCache.setIfAbsent(lockKey, "1", VERIFY_LOCK_TTL)) {
                if (isTopUpRequest) {
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
                if (!result.containsKey("error")) {
                    redisCache.put(verifiedKey, result, VERIFIED_RESULT_TTL);
                } else {
                    // Payment is still pending (not a provisioning error) — release the claim
                    // immediately so the next 2.5s poll actually rechecks Paystack instead of
                    // being blocked behind this same claim for the rest of its TTL.
                    redisCache.delete(lockKey);
                }
            } else {
                // Someone else is provisioning this exact reference right now — behave like
                // "not confirmed yet" rather than double-provisioning; the mobile app's poll
                // will retry in ~2.5s, by which point the in-flight call above will have cached
                // the real result for this reference.
                result = Map.of("error", "Payment verification in progress. Please try again in a moment.");
            }
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

                    // Guard against processing the same reference twice — the mobile app may poll
                    // this endpoint repeatedly (to auto-close the checkout browser the instant
                    // payment succeeds) rather than calling it exactly once.
                    if (!esimPurchaseRepository.existsByTransactionId(reference)) {
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
                    }
                } catch (Exception e) {
                    log.warn("[Paystack] Failed to save purchase records: {}", e.getMessage());
                }
            });
        }

        return ResponseEntity.ok(result);
    }
}
