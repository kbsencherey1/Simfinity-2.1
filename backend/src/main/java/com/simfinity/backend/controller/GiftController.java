package com.simfinity.backend.controller;

import com.simfinity.backend.entity.EsimPurchase;
import com.simfinity.backend.repository.EsimPurchaseRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/gift")
public class GiftController {

    private final EsimPurchaseRepository esimPurchaseRepository;

    public GiftController(EsimPurchaseRepository esimPurchaseRepository) {
        this.esimPurchaseRepository = esimPurchaseRepository;
    }

    /** Used by the mobile app to fetch gift details by token (JSON). */
    @GetMapping("/{token}")
    public ResponseEntity<?> getGift(@PathVariable String token) {
        Optional<EsimPurchase> opt = esimPurchaseRepository.findByGiftToken(token);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        EsimPurchase p = opt.get();
        return ResponseEntity.ok(Map.of(
            "planName", p.getPlanName() != null ? p.getPlanName() : "",
            "dataGb", p.getDataGb() != null ? p.getDataGb() : "",
            "validityDays", p.getValidityDays() != null ? p.getValidityDays() : 0,
            "iccid", p.getIccid() != null ? p.getIccid() : "",
            "activationCode", p.getActivationCode() != null ? p.getActivationCode() : "",
            "smdpAddress", p.getSmdpAddress() != null ? p.getSmdpAddress() : "",
            "qrCodeUrl", p.getQrCodeUrl() != null ? p.getQrCodeUrl() : ""
        ));
    }

    /**
     * Landing page linked from gift emails — opens in a browser.
     * Tries to launch the Simfinity app via deep link; shows fallback if not installed.
     */
    @GetMapping(value = "/claim/{token}", produces = "text/html;charset=UTF-8")
    public ResponseEntity<String> claimGift(@PathVariable String token) {
        Optional<EsimPurchase> opt = esimPurchaseRepository.findByGiftToken(token);
        String html = opt.isEmpty()
            ? notFoundHtml()
            : claimHtml(token,
                opt.get().getPlanName() != null ? opt.get().getPlanName() : "eSIM Plan",
                opt.get().getDataGb() != null ? opt.get().getDataGb() : "",
                opt.get().getValidityDays() != null ? opt.get().getValidityDays() : 30);
        return ResponseEntity.ok(html);
    }

    // ── HTML templates ────────────────────────────────────────────────────────

    private String claimHtml(String token, String planName, String dataGb, int validityDays) {
        String deepLink = "simfinity://gift-esim?token=" + token;
        return """
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width,initial-scale=1">
          <title>eSIM Gift — Simfinity</title>
          <style>
            *{box-sizing:border-box;margin:0;padding:0}
            body{background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
                 min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
            .card{background:#141414;border:1px solid rgba(255,215,0,0.2);border-radius:20px;
                  padding:40px 32px;max-width:400px;width:100%%;text-align:center}
            .brand{color:#FFD700;font-size:13px;font-weight:900;letter-spacing:2.5px;margin-bottom:28px}
            .gift-icon{font-size:52px;margin-bottom:16px}
            h1{color:#fff;font-size:22px;font-weight:800;margin-bottom:8px}
            .plan-badge{display:inline-block;background:rgba(255,215,0,0.12);border:1px solid rgba(255,215,0,0.3);
                        border-radius:8px;padding:8px 18px;margin:16px 0 24px}
            .plan-name{color:#FFD700;font-size:16px;font-weight:800}
            .plan-meta{color:#a0997a;font-size:12px;margin-top:4px}
            .divider{height:1px;background:rgba(255,215,0,0.2);margin:0 0 28px}
            p{color:#a0997a;font-size:14px;line-height:1.6;margin-bottom:20px}
            .btn{display:block;background:#FFD700;color:#000;font-weight:800;font-size:14px;
                 letter-spacing:0.5px;text-decoration:none;padding:16px 24px;border-radius:12px;
                 margin-bottom:16px}
            .hint{color:#555;font-size:11px;line-height:1.6}
            .hint a{color:#FFD700;text-decoration:none}
          </style>
        </head>
        <body>
          <div class="card">
            <div class="brand">SIMFINITY eSIM</div>
            <div class="gift-icon">🎁</div>
            <h1>You've Got an eSIM Gift!</h1>

            <div class="plan-badge">
              <div class="plan-name">%s</div>
              <div class="plan-meta">%s · %d days validity</div>
            </div>

            <div class="divider"></div>

            <p>Tap the button below to open the Simfinity app and claim your free eSIM.</p>

            <a class="btn" href="%s" id="openBtn">Open in Simfinity App</a>

            <p class="hint">
              Don't have the app yet?<br>
              <a href="https://apps.apple.com/app/simfinity">Download on the App Store</a>
              &nbsp;·&nbsp;
              <a href="https://play.google.com/store/apps/details?id=com.simfinity.app">Get it on Google Play</a>
            </p>
          </div>
          <script>
            // Auto-attempt deep link after a short delay so the page renders first
            setTimeout(function() {
              window.location.href = "%s";
            }, 800);
          </script>
        </body>
        </html>
        """.formatted(planName, dataGb, validityDays, deepLink, deepLink);
    }

    private String notFoundHtml() {
        return """
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width,initial-scale=1">
          <title>Gift Not Found — Simfinity</title>
          <style>
            body{margin:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
                 display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px}
            .card{background:#141414;border:1px solid rgba(204,78,60,0.3);border-radius:20px;
                  padding:40px 32px;max-width:400px;width:100%%;text-align:center}
            .icon{font-size:48px;margin-bottom:16px}
            h1{color:#fff;font-size:22px;font-weight:800;margin-bottom:10px}
            p{color:#a0997a;font-size:14px;line-height:1.6}
            .brand{color:#FFD700;font-size:11px;font-weight:800;letter-spacing:2px;margin-top:28px}
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">✕</div>
            <h1>Gift Link Invalid</h1>
            <p>This gift link has already been claimed or has expired.<br>Contact the sender for a new one.</p>
            <div class="brand">SIMFINITY · ROOTED IN GHANA</div>
          </div>
        </body>
        </html>
        """;
    }
}
