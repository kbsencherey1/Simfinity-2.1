package com.simfinity.backend.controller;

import com.simfinity.backend.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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

    /** Opened in a browser from the verification email — returns a branded HTML page. */
    @GetMapping(value = "/verify-email", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> verifyEmail(@RequestParam String token) {
        Map<String, Object> result = authService.verifyEmail(token);
        boolean ok = result.containsKey("success");
        String html = ok ? verifySuccessHtml() : verifyErrorHtml();
        return ResponseEntity.status(ok ? 200 : 400)
            .contentType(MediaType.TEXT_HTML)
            .body(html);
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
    public ResponseEntity<Map<String, Object>> resendVerification(
            org.springframework.security.core.Authentication auth) {
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

    private String verifySuccessHtml() {
        return """
        <!DOCTYPE html><html><head><meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>Email Verified — Simfinity</title>
        <style>body{margin:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
        display:flex;align-items:center;justify-content:center;min-height:100vh}
        .card{background:#141414;border:1px solid rgba(255,215,0,0.2);border-radius:20px;padding:48px 36px;
        max-width:420px;text-align:center}
        .icon{font-size:48px;margin-bottom:16px}
        h1{color:#fff;font-size:24px;font-weight:800;margin:0 0 10px}
        p{color:#a0997a;font-size:15px;margin:0 0 28px;line-height:1.6}
        .brand{color:#FFD700;font-size:11px;font-weight:800;letter-spacing:2px;margin-top:32px}
        </style></head>
        <body><div class="card">
          <div class="icon">✓</div>
          <h1>Email Verified!</h1>
          <p>Your Simfinity account is now fully verified.<br>You can return to the app.</p>
          <div class="brand">SIMFINITY · ROOTED IN GHANA</div>
        </div></body></html>
        """;
    }

    private String verifyErrorHtml() {
        return """
        <!DOCTYPE html><html><head><meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>Verification Failed — Simfinity</title>
        <style>body{margin:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
        display:flex;align-items:center;justify-content:center;min-height:100vh}
        .card{background:#141414;border:1px solid rgba(204,78,60,0.3);border-radius:20px;padding:48px 36px;
        max-width:420px;text-align:center}
        .icon{font-size:48px;margin-bottom:16px}
        h1{color:#fff;font-size:24px;font-weight:800;margin:0 0 10px}
        p{color:#a0997a;font-size:15px;margin:0 0 28px;line-height:1.6}
        .brand{color:#FFD700;font-size:11px;font-weight:800;letter-spacing:2px;margin-top:32px}
        </style></head>
        <body><div class="card">
          <div class="icon">✕</div>
          <h1>Link Invalid or Expired</h1>
          <p>This verification link has already been used or has expired.<br>Open Simfinity and request a new one.</p>
          <div class="brand">SIMFINITY · ROOTED IN GHANA</div>
        </div></body></html>
        """;
    }
}
