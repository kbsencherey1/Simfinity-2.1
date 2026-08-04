package com.simfinity.backend.controller;

import com.simfinity.backend.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        String fullName = body.get("fullName");
        String referredByCode = body.get("referredByCode");
        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required."));
        }
        Map<String, Object> result = authService.register(email, password, fullName, referredByCode);
        return result.containsKey("error")
            ? ResponseEntity.badRequest().body(result)
            : ResponseEntity.ok(result);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required."));
        }
        Map<String, Object> result = authService.login(email, password);
        return result.containsKey("error")
            ? ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result)
            : ResponseEntity.ok(result);
    }

    @PostMapping("/verify-email-otp")
    public ResponseEntity<Map<String, Object>> verifyEmailOtp(
            @RequestBody Map<String, String> body,
            Authentication auth) {
        String code = body.get("code");
        Map<String, Object> result = authService.verifyEmailOtp(auth.getName(), code);
        return result.containsKey("error")
            ? ResponseEntity.badRequest().body(result)
            : ResponseEntity.ok(result);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required."));
        }
        return ResponseEntity.ok(authService.forgotPassword(email));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<Map<String, Object>> resendVerification(Authentication auth) {
        Map<String, Object> result = authService.resendVerification(auth.getName());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        String newPassword = body.get("newPassword");
        if (token == null || token.isBlank() || newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Token and new password are required."));
        }
        Map<String, Object> result = authService.resetPassword(token, newPassword);
        return result.containsKey("error")
            ? ResponseEntity.badRequest().body(result)
            : ResponseEntity.ok(result);
    }
}
