package com.simfinity.backend.service;

import com.simfinity.backend.entity.User;
import com.simfinity.backend.repository.UserRepository;
import com.simfinity.backend.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
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

        String verificationToken = UUID.randomUUID().toString().replace("-", "");
        user.setVerificationToken(verificationToken);

        userRepository.save(user);

        String suffix = UUID.randomUUID().toString().replaceAll("-", "").substring(0, 4).toUpperCase();
        user.setReferralCode("SIM-" + user.getId() + "-" + suffix);

        if (referredByCode != null && !referredByCode.isBlank()) {
            userRepository.findByReferralCode(referredByCode.trim().toUpperCase()).ifPresent(referrer ->
                user.setReferredById(referrer.getId())
            );
        }

        userRepository.save(user);

        // Send verification email — best-effort, don't block registration
        emailService.sendVerificationEmail(normalizedEmail, verificationToken);

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

    public Map<String, Object> verifyEmail(String token) {
        return userRepository.findByVerificationToken(token).map(user -> {
            user.setEmailVerified(true);
            user.setVerificationToken(null);
            userRepository.save(user);
            return Map.<String, Object>of("success", true);
        }).orElse(Map.of("error", "Invalid or already used verification link."));
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
            String token = UUID.randomUUID().toString().replace("-", "");
            user.setVerificationToken(token);
            userRepository.save(user);
            emailService.sendVerificationEmail(user.getEmail(), token);
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
