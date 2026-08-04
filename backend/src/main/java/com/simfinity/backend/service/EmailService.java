package com.simfinity.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private static final String FROM_NAME = "Simfinity";
    private static final String FROM_EMAIL = "kwasisencherey28@gmail.com";
    private static final String BREVO_URL = "https://api.brevo.com/v3/smtp/email";

    @Value("${brevo.api.key:}")
    private String apiKey;

    @Value("${app.web-url:http://localhost:8090}")
    private String webBaseUrl;

    private final RestTemplate restTemplate;

    public EmailService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    // ── Email Verification ────────────────────────────────────────────────────

    public void sendVerificationEmail(String toEmail, String otpCode) {
        String html = otpTemplate(
            "Verify Your Email",
            "One quick step to confirm your account.",
            """
            <p style="color:#a0997a;font-size:15px;margin:0 0 28px">
              Hi there! Thanks for joining Simfinity. Enter this code in the app to verify
              your email address and activate your account.
            </p>
            """,
            otpCode,
            "This code expires in 10 minutes. If you didn't create a Simfinity account, you can safely ignore this email."
        );
        send(toEmail, "Verify your Simfinity account", html);
    }

    // ── Password Reset ────────────────────────────────────────────────────────

    public void sendPasswordResetEmail(String toEmail, String token) {
        // A real https:// link works in every mail client on every device — unlike a
        // simfinity:// deep link, which desktop email clients can't open at all, and
        // which silently fails on phones too if the OS/mail app doesn't hand it off to
        // the app. The web build serves this same reset-password screen, so it's a
        // fully working destination on its own, no native app required.
        String webLink = webBaseUrl + "/reset-password?token=" + token;
        String deepLink = "simfinity://reset-password?token=" + token;
        String html = baseTemplate(
            "Reset Your Password",
            "We received a request to reset your password.",
            """
            <p style="color:#a0997a;font-size:15px;margin:0 0 28px">
              Tap the button below to choose a new password.
              This link expires in <strong style="color:#fff">1 hour</strong>.
            </p>
            """,
            webLink,
            "Reset Password",
            "If you didn't request a password reset, ignore this email — your password will not change.<br><br>"
            + "On your phone with the app installed? <a href=\"" + deepLink + "\" style=\"color:#FFD700\">Open in the Simfinity app instead</a>."
        );
        send(toEmail, "Reset your Simfinity password", html);
    }

    // ── Gift eSIM ─────────────────────────────────────────────────────────────

    public void sendGiftEsimEmail(String toEmail, String senderName, String planName, String shareUrl) {
        String html = baseTemplate(
            "You've Received an eSIM Gift!",
            senderName + " sent you a Simfinity eSIM.",
            String.format("""
            <p style="color:#a0997a;font-size:15px;margin:0 0 12px">
              <strong style="color:#fff">%s</strong> has gifted you a
              <strong style="color:#FFD700">%s</strong> eSIM on Simfinity.
            </p>
            <p style="color:#a0997a;font-size:15px;margin:0 0 28px">
              Tap the button below on your phone to claim it. You'll need the Simfinity app installed.
            </p>
            """, senderName, planName),
            shareUrl,
            "Claim Your eSIM Gift",
            "This gift link can only be claimed once. Download Simfinity from the App Store or Google Play to get started."
        );
        send(toEmail, senderName + " gifted you a Simfinity eSIM!", html);
    }

    // ── Internal ──────────────────────────────────────────────────────────────

    private void send(String toEmail, String subject, String html) {
        String key = apiKey;
        if (key == null || key.isBlank()) {
            log.warn("[Email] BREVO_API_KEY not set — skipping send to {}", toEmail);
            return;
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("api-key", key);
            headers.setContentType(MediaType.APPLICATION_JSON);
            Map<String, Object> body = Map.of(
                "sender", Map.of("name", FROM_NAME, "email", FROM_EMAIL),
                "to", List.of(Map.of("email", toEmail)),
                "subject", subject,
                "htmlContent", html
            );
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<?> res = restTemplate.postForEntity(BREVO_URL, entity, Void.class);
            log.info("[Email] Sent '{}' to {} — status {}", subject, toEmail, res.getStatusCode());
        } catch (Exception e) {
            log.warn("[Email] Failed to send '{}' to {}: {}", subject, toEmail, e.getMessage());
        }
    }

    private String otpTemplate(String title, String subtitle, String bodyHtml, String code, String footnote) {
        return """
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
        <body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
          <table width="100%%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px">
            <tr><td align="center">
              <table width="100%%" cellpadding="0" cellspacing="0" style="max-width:520px">

                <!-- Header -->
                <tr><td style="padding-bottom:32px;text-align:center">
                  <div style="display:inline-block;background:#111;border:1px solid rgba(255,215,0,0.25);border-radius:12px;padding:10px 20px">
                    <span style="color:#FFD700;font-size:18px;font-weight:900;letter-spacing:2px">SIMFINITY</span>
                  </div>
                </td></tr>

                <!-- Card -->
                <tr><td style="background:#141414;border:1px solid rgba(255,215,0,0.15);border-radius:16px;padding:36px 32px">

                  <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 6px">%s</h1>
                  <p style="color:#FFD700;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin:0 0 24px">%s</p>

                  <div style="width:100%%;height:2px;background:linear-gradient(90deg,#FFD700,transparent);margin:0 0 28px;border-radius:1px"></div>

                  %s

                  <!-- OTP Code -->
                  <table width="100%%" cellpadding="0" cellspacing="0" style="margin:0 0 28px">
                    <tr><td align="center">
                      <div style="display:inline-block;background:#0a0a0a;border:1px solid rgba(255,215,0,0.3);
                                  border-radius:10px;padding:18px 32px">
                        <span style="color:#FFD700;font-size:32px;font-weight:800;letter-spacing:10px">%s</span>
                      </div>
                    </td></tr>
                  </table>

                  <p style="color:#555;font-size:11px;margin:0;line-height:1.6">%s</p>
                </td></tr>

                <!-- Footer -->
                <tr><td style="padding-top:24px;text-align:center">
                  <p style="color:#333;font-size:10px;letter-spacing:1.5px;margin:0">ROOTED IN GHANA · SIMFINITY eSIM</p>
                </td></tr>

              </table>
            </td></tr>
          </table>
        </body>
        </html>
        """.formatted(title, subtitle, bodyHtml, code, footnote);
    }

    private String baseTemplate(String title, String subtitle, String bodyHtml,
                                 String ctaUrl, String ctaLabel, String footnote) {
        return """
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
        <body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
          <table width="100%%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px">
            <tr><td align="center">
              <table width="100%%" cellpadding="0" cellspacing="0" style="max-width:520px">

                <!-- Header -->
                <tr><td style="padding-bottom:32px;text-align:center">
                  <div style="display:inline-block;background:#111;border:1px solid rgba(255,215,0,0.25);border-radius:12px;padding:10px 20px">
                    <span style="color:#FFD700;font-size:18px;font-weight:900;letter-spacing:2px">SIMFINITY</span>
                  </div>
                </td></tr>

                <!-- Card -->
                <tr><td style="background:#141414;border:1px solid rgba(255,215,0,0.15);border-radius:16px;padding:36px 32px">

                  <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 6px">%s</h1>
                  <p style="color:#FFD700;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin:0 0 24px">%s</p>

                  <div style="width:100%%;height:2px;background:linear-gradient(90deg,#FFD700,transparent);margin:0 0 28px;border-radius:1px"></div>

                  %s

                  <!-- CTA Button -->
                  <table width="100%%" cellpadding="0" cellspacing="0" style="margin:0 0 28px">
                    <tr><td align="center">
                      <a href="%s"
                         style="display:inline-block;background:#FFD700;color:#000;font-weight:800;font-size:14px;
                                letter-spacing:1px;text-decoration:none;padding:14px 36px;border-radius:10px;
                                text-transform:uppercase">
                        %s
                      </a>
                    </td></tr>
                  </table>

                  <p style="color:#555;font-size:11px;margin:0;line-height:1.6">%s</p>
                </td></tr>

                <!-- Footer -->
                <tr><td style="padding-top:24px;text-align:center">
                  <p style="color:#333;font-size:10px;letter-spacing:1.5px;margin:0">ROOTED IN GHANA · SIMFINITY eSIM</p>
                </td></tr>

              </table>
            </td></tr>
          </table>
        </body>
        </html>
        """.formatted(title, subtitle, bodyHtml, ctaUrl, ctaLabel, footnote);
    }
}
