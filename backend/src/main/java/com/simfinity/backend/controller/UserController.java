package com.simfinity.backend.controller;

import com.simfinity.backend.entity.EsimPurchase;
import com.simfinity.backend.entity.PaymentRecord;
import com.simfinity.backend.entity.ReferralReward;
import com.simfinity.backend.entity.User;
import com.simfinity.backend.repository.EsimPurchaseRepository;
import com.simfinity.backend.repository.PaymentRepository;
import com.simfinity.backend.repository.ReferralRewardRepository;
import com.simfinity.backend.repository.UserRepository;
import com.simfinity.backend.service.EmailService;
import com.simfinity.backend.service.ZenditService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserRepository userRepository;
    private final EsimPurchaseRepository esimPurchaseRepository;
    private final PaymentRepository paymentRepository;
    private final ReferralRewardRepository referralRewardRepository;
    private final ZenditService zenditService;
    private final EmailService emailService;

    @Value("${app.avatar-dir:/app/avatars}")
    private String avatarDir;

    @Value("${app.base-url:http://localhost:3000}")
    private String appBaseUrl;

    public UserController(UserRepository userRepository,
                          EsimPurchaseRepository esimPurchaseRepository,
                          PaymentRepository paymentRepository,
                          ReferralRewardRepository referralRewardRepository,
                          ZenditService zenditService,
                          EmailService emailService) {
        this.userRepository = userRepository;
        this.esimPurchaseRepository = esimPurchaseRepository;
        this.paymentRepository = paymentRepository;
        this.referralRewardRepository = referralRewardRepository;
        this.zenditService = zenditService;
        this.emailService = emailService;
    }

    private static final java.util.Set<String> ALLOWED_IMAGE_TYPES =
        java.util.Set.of("image/jpeg", "image/png", "image/webp");

    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadAvatar(@RequestParam("file") MultipartFile file,
                                          Authentication auth) throws IOException {
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Only JPEG, PNG, or WebP images are allowed."));
        }
        if (file.getSize() > 3 * 1024 * 1024) {
            return ResponseEntity.badRequest().body(Map.of("error", "Image must be under 3 MB."));
        }

        Optional<User> userOpt = userRepository.findByEmail(auth.getName());
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();

        User user = userOpt.get();
        Path dir = Paths.get(avatarDir);
        Files.createDirectories(dir);

        String filename = user.getId() + ".jpg";
        Path dest = dir.resolve(filename);
        Files.write(dest, file.getBytes());

        user.setAvatarPath(dest.toString());
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("avatarUrl", "/api/user/avatar/" + user.getId()));
    }

    @GetMapping("/avatar/{userId}")
    public ResponseEntity<byte[]> getAvatar(@PathVariable Long userId) throws IOException {
        Path file = Paths.get(avatarDir, userId + ".jpg");
        if (!Files.exists(file)) return ResponseEntity.notFound().build();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_JPEG);
        return ResponseEntity.ok().headers(headers).body(Files.readAllBytes(file));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> body, Authentication auth) {
        return userRepository.findByEmail(auth.getName()).map(user -> {
            if (body.containsKey("fullName")) user.setFullName(body.get("fullName"));
            if (body.containsKey("phoneNumber")) user.setPhoneNumber(body.get("phoneNumber"));
            if (body.containsKey("dateOfBirth")) user.setDateOfBirth(body.get("dateOfBirth"));
            userRepository.save(user);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "fullName", user.getFullName() != null ? user.getFullName() : "",
                "phoneNumber", user.getPhoneNumber() != null ? user.getPhoneNumber() : "",
                "dateOfBirth", user.getDateOfBirth() != null ? user.getDateOfBirth() : ""
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/push-token")
    public ResponseEntity<?> savePushToken(@RequestBody Map<String, String> body, Authentication auth) {
        return userRepository.findByEmail(auth.getName()).map(user -> {
            user.setPushToken(body.get("token"));
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("ok", true));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/esims/{id}/share")
    public ResponseEntity<?> shareEsim(@PathVariable Long id, Authentication auth) {
        Optional<User> userOpt = userRepository.findByEmail(auth.getName());
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();

        // findByIdAndUser performs the ownership check in the query — no lazy loading needed
        Optional<EsimPurchase> purchaseOpt = esimPurchaseRepository.findByIdAndUser(id, userOpt.get());
        if (purchaseOpt.isEmpty()) return ResponseEntity.status(404).build();

        EsimPurchase p = purchaseOpt.get();
        if (p.getGiftToken() == null) {
            p.setGiftToken(UUID.randomUUID().toString());
            esimPurchaseRepository.save(p);
        }

        String shareUrl = "simfinity://gift-esim?token=" + p.getGiftToken();
        return ResponseEntity.ok(Map.of("token", p.getGiftToken(), "shareUrl", shareUrl));
    }

    @PostMapping("/esims/{id}/share/email")
    public ResponseEntity<?> giftEsimByEmail(@PathVariable Long id,
                                              @RequestBody Map<String, String> body,
                                              Authentication auth) {
        Optional<User> userOpt = userRepository.findByEmail(auth.getName());
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();

        Optional<EsimPurchase> purchaseOpt = esimPurchaseRepository.findByIdAndUser(id, userOpt.get());
        if (purchaseOpt.isEmpty()) return ResponseEntity.status(404).build();

        String recipientEmail = body.get("recipientEmail");
        if (recipientEmail == null || recipientEmail.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "recipientEmail is required."));
        }

        EsimPurchase p = purchaseOpt.get();
        if (p.getGiftToken() == null) {
            p.setGiftToken(UUID.randomUUID().toString());
            esimPurchaseRepository.save(p);
        }

        // Use an https:// landing page so email clients don't block the link.
        // The page auto-redirects to the simfinity:// deep link once opened on a phone.
        String shareUrl = appBaseUrl + "/api/gift/claim/" + p.getGiftToken();
        String senderName = userOpt.get().getFullName() != null ? userOpt.get().getFullName() : "Someone";
        String planName = p.getPlanName() != null ? p.getPlanName() : "eSIM Plan";
        emailService.sendGiftEsimEmail(recipientEmail, senderName, planName, shareUrl);

        return ResponseEntity.ok(Map.of("ok", true, "shareUrl", shareUrl));
    }

    @GetMapping("/esims/{id}/usage")
    public ResponseEntity<?> getEsimUsage(@PathVariable Long id, Authentication auth) {
        Optional<User> userOpt = userRepository.findByEmail(auth.getName());
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();

        Optional<EsimPurchase> purchaseOpt = esimPurchaseRepository.findByIdAndUser(id, userOpt.get());
        if (purchaseOpt.isEmpty()) return ResponseEntity.status(404).build();

        EsimPurchase p = purchaseOpt.get();
        Map<String, Object> usage = zenditService.getEsimUsage(p.getTransactionId(), p.getDataGb());
        return ResponseEntity.ok(usage);
    }

    @GetMapping("/referrals")
    public ResponseEntity<?> getReferrals(Authentication auth) {
        Optional<User> userOpt = userRepository.findByEmail(auth.getName());
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();
        User current = userOpt.get();

        List<User> referred = userRepository.findByReferredById(current.getId());

        long activated = referred.stream().filter(u -> esimPurchaseRepository.existsByUser(u)).count();

        List<Map<String, Object>> referralList = referred.stream().map(u -> {
            boolean act = esimPurchaseRepository.existsByUser(u);
            String firstName = u.getFullName() != null && !u.getFullName().isBlank()
                ? u.getFullName().split("\\s+")[0] : "User";
            Map<String, Object> m = new HashMap<>();
            m.put("firstName", firstName);
            m.put("status", act ? "activated" : "signed_up");
            m.put("joinedAt", u.getCreatedAt() != null ? u.getCreatedAt().toLocalDate().toString() : null);
            return m;
        }).toList();

        Map<String, Object> result = new HashMap<>();
        result.put("code", current.getReferralCode() != null ? current.getReferralCode() : "");
        result.put("totalReferred", referred.size());
        result.put("totalActivated", activated);
        result.put("rewardsEarned", referralRewardRepository.countByUser(current));
        result.put("referrals", referralList);
        return ResponseEntity.ok(result);
    }

    /** Unclaimed discounts — applied at checkout (see PaystackController), not redeemed here. */
    @GetMapping("/referral-rewards")
    public ResponseEntity<?> getReferralRewards(Authentication auth) {
        Optional<User> userOpt = userRepository.findByEmail(auth.getName());
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();

        List<Map<String, Object>> rewards = referralRewardRepository
            .findByUserAndStatusOrderByEarnedAtDesc(userOpt.get(), "UNCLAIMED")
            .stream().map(r -> {
                User referred = r.getReferredUser();
                String firstName = referred != null && referred.getFullName() != null && !referred.getFullName().isBlank()
                    ? referred.getFullName().split("\\s+")[0] : "A friend";
                Map<String, Object> m = new HashMap<>();
                m.put("id", r.getId());
                m.put("discountPercent", r.getDiscountPercent());
                m.put("earnedAt", r.getEarnedAt() != null ? r.getEarnedAt().toString() : null);
                m.put("referredName", firstName);
                return m;
            }).toList();

        return ResponseEntity.ok(rewards);
    }

    @GetMapping("/esims")
    public ResponseEntity<?> getEsims(Authentication auth) {
        Optional<User> userOpt = userRepository.findByEmail(auth.getName());
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();
        List<Map<String, Object>> result = esimPurchaseRepository
            .findByUserOrderByPurchasedAtDesc(userOpt.get())
            .stream().map(this::esimToMap).toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/payments")
    public ResponseEntity<?> getPayments(Authentication auth) {
        Optional<User> userOpt = userRepository.findByEmail(auth.getName());
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();
        List<Map<String, Object>> result = paymentRepository
            .findByUserOrderByCreatedAtDesc(userOpt.get())
            .stream().map(this::paymentToMap).toList();
        return ResponseEntity.ok(result);
    }

    private Map<String, Object> esimToMap(EsimPurchase p) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", "#GH-" + p.getId());
        m.put("dbId", p.getId());
        m.put("giftToken", p.getGiftToken());
        m.put("planId", p.getPlanId());
        m.put("planName", p.getPlanName());
        m.put("totalDataGb", p.getDataGb());
        m.put("iccid", p.getIccid());
        m.put("activationCode", p.getActivationCode());
        m.put("smdpAddress", p.getSmdpAddress());
        m.put("qrCodeUrl", p.getQrCodeUrl());
        m.put("purchasedAt", p.getPurchasedAt() != null ? p.getPurchasedAt().toString() : null);

        boolean unlimited = p.getDataGb() != null && p.getDataGb().toLowerCase().contains("unlimited");
        m.put("leftDataGb", unlimited ? 50.0 : parseGb(p.getDataGb()));

        // Derive real status from expiry
        int validityDays = p.getValidityDays() != null ? p.getValidityDays() : 30;
        if (p.getPurchasedAt() != null) {
            LocalDateTime expiry = p.getPurchasedAt().plusDays(validityDays);
            boolean expired = expiry.isBefore(LocalDateTime.now());
            m.put("status", expired ? "completed" : "active");
            long minutesLeft = expired ? 0 : java.time.Duration.between(LocalDateTime.now(), expiry).toMinutes();
            m.put("expiresInDays", expired ? 0 : (int) (minutesLeft / (60 * 24)));
            m.put("expiresInMinutes", minutesLeft);
            if (expired) {
                m.put("completedDate", expiry.toLocalDate().toString());
            }
        } else {
            m.put("status", p.getStatus());
            m.put("expiresInDays", validityDays);
            m.put("expiresInMinutes", (long) validityDays * 24 * 60);
        }

        return m;
    }

    private Map<String, Object> paymentToMap(PaymentRecord p) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", p.getId());
        m.put("reference", p.getReference());
        m.put("amountGhs", p.getAmountGhs());
        m.put("planId", p.getPlanId());
        m.put("planName", p.getPlanName());
        m.put("status", p.getStatus());
        m.put("createdAt", p.getCreatedAt() != null ? p.getCreatedAt().toString() : null);
        return m;
    }

    private double parseGb(String dataGb) {
        if (dataGb == null) return 0;
        try {
            return Double.parseDouble(dataGb.replaceAll("[^\\d.]", ""));
        } catch (Exception e) {
            return 0;
        }
    }
}
