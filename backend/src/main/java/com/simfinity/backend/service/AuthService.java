package com.simfinity.backend.service;

import com.simfinity.backend.entity.User;
import com.simfinity.backend.repository.UserRepository;
import com.simfinity.backend.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {

    private static final Duration OTP_TTL = Duration.ofMinutes(10);
    private static final int OTP_MAX_ATTEMPTS = 5;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;
    private final RedisCacheHelper redisCache;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil, EmailService emailService, RedisCacheHelper redisCache) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
        this.redisCache = redisCache;
    }

    private static String otpKey(String email) {
        return "otp:email-verify:" + email;
    }

    private void generateAndSendOtp(String email) {
        String code = String.format("%06d", RANDOM.nextInt(1_000_000));
        redisCache.put(otpKey(email), Map.of("code", code, "attempts", 0), OTP_TTL);
        emailService.sendVerificationEmail(email, code);
    }

    public Map<String, Object> register(String email, String password, String fullName, String referredByCode) {
        String normalizedEmail = email.toLowerCase().trim();
        if (!normalizedEmail.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            return Map.of("error", "Please enter a valid email address.");
        }
        if (password == null || password.length() < 8) {
            return Map.of("error", "Password must be at least 8 characters.");
        }
        if (userRepository.existsByEmail(normalizedEmail)) {
            return Map.of("error", "An account with this email already exists.");
        }
        User user = new User();
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setFullName(fullName != null ? fullName.trim() : "");

        userRepository.save(user);

        String suffix = UUID.randomUUID().toString().replaceAll("-", "").substring(0, 4).toUpperCase();
        user.setReferralCode("SIM-" + user.getId() + "-" + suffix);

        if (referredByCode != null && !referredByCode.isBlank()) {
            userRepository.findByReferralCode(referredByCode.trim().toUpperCase()).ifPresent(referrer ->
                user.setReferredById(referrer.getId())
            );
        }

        userRepository.save(user);

        // Send verification OTP — best-effort, don't block registration
        generateAndSendOtp(normalizedEmail);

        String token = jwtUtil.generateToken(user.getEmail());
        return Map.of(
            "success", true,
            "token", token,
            "email", user.getEmail(),
            "fullName", user.getFullName() != null ? user.getFullName() : "",
            "userId", user.getId(),
            "referralCode", user.getReferralCode(),
            "emailVerified", false
        );
    }

    public Map<String, Object> login(String email, String password) {
        String normalizedEmail = email.toLowerCase().trim();
        return userRepository.findByEmail(normalizedEmail).map(user -> {
            if (!passwordEncoder.matches(password, user.getPasswordHash())) {
                return Map.<String, Object>of("error", "Incorrect password.");
            }
            if (user.getReferralCode() == null) {
                String suffix = UUID.randomUUID().toString().replaceAll("-", "").substring(0, 4).toUpperCase();
                user.setReferralCode("SIM-" + user.getId() + "-" + suffix);
                userRepository.save(user);
            }
            String token = jwtUtil.generateToken(user.getEmail());
            return Map.<String, Object>of(
                "success", true,
                "token", token,
                "email", user.getEmail(),
                "fullName", user.getFullName() != null ? user.getFullName() : "",
                "userId", user.getId(),
                "referralCode", user.getReferralCode(),
                "emailVerified", user.isEmailVerified()
            );
        }).orElse(Map.of("error", "No account found with this email."));
    }

    public Map<String, Object> verifyEmailOtp(String email, String code) {
        String normalizedEmail = email.toLowerCase().trim();
        User user = userRepository.findByEmail(normalizedEmail).orElse(null);
        if (user == null) {
            return Map.of("error", "Account not found.");
        }
        if (user.isEmailVerified()) {
            return Map.of("success", true, "message", "Email already verified.");
        }
        if (code == null || code.isBlank()) {
            return Map.of("error", "Enter the 6-digit code sent to your email.");
        }

        String key = otpKey(normalizedEmail);
        Map<String, Object> entry = redisCache.get(key);
        if (entry == null) {
            return Map.of("error", "This code has expired. Request a new one.");
        }

        String storedCode = String.valueOf(entry.get("code"));
        if (!storedCode.equals(code.trim())) {
            int attempts = ((Number) entry.getOrDefault("attempts", 0)).intValue() + 1;
            if (attempts >= OTP_MAX_ATTEMPTS) {
                redisCache.delete(key);
                return Map.of("error", "Too many incorrect attempts. Request a new code.");
            }
            redisCache.put(key, Map.of("code", storedCode, "attempts", attempts), OTP_TTL);
            int remaining = OTP_MAX_ATTEMPTS - attempts;
            return Map.of("error", "Incorrect code. " + remaining + (remaining == 1 ? " attempt" : " attempts") + " remaining.");
        }

        user.setEmailVerified(true);
        userRepository.save(user);
        redisCache.delete(key);
        return Map.of("success", true);
    }

    public Map<String, Object> forgotPassword(String email) {
        String normalizedEmail = email.toLowerCase().trim();
        userRepository.findByEmail(normalizedEmail).ifPresent(user -> {
            String resetToken = UUID.randomUUID().toString().replace("-", "");
            user.setResetToken(resetToken);
            user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
            userRepository.save(user);
            emailService.sendPasswordResetEmail(normalizedEmail, resetToken);
        });
        // Always return success — don't reveal whether the email exists
        return Map.of("success", true, "message", "If that email is registered, a reset link has been sent.");
    }

    public Map<String, Object> resendVerification(String email) {
        return userRepository.findByEmail(email.toLowerCase().trim()).map(user -> {
            if (user.isEmailVerified()) {
                return Map.<String, Object>of("success", true, "message", "Email already verified.");
            }
            generateAndSendOtp(user.getEmail());
            return Map.<String, Object>of("success", true);
        }).orElse(Map.of("error", "Account not found."));
    }

    public Map<String, Object> resetPassword(String token, String newPassword) {
        return userRepository.findByResetToken(token).map(user -> {
            if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
                return Map.<String, Object>of("error", "This reset link has expired. Please request a new one.");
            }
            if (newPassword == null || newPassword.length() < 8) {
                return Map.<String, Object>of("error", "Password must be at least 8 characters.");
            }
            user.setPasswordHash(passwordEncoder.encode(newPassword));
            user.setResetToken(null);
            user.setResetTokenExpiry(null);
            userRepository.save(user);
            return Map.<String, Object>of("success", true);
        }).orElse(Map.of("error", "Invalid or expired reset link."));
    }
}
