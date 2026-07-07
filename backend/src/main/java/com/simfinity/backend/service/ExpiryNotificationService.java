package com.simfinity.backend.service;

import com.simfinity.backend.entity.EsimPurchase;
import com.simfinity.backend.repository.EsimPurchaseRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ExpiryNotificationService {

    private static final Logger log = LoggerFactory.getLogger(ExpiryNotificationService.class);
    private static final String EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

    private final EsimPurchaseRepository esimPurchaseRepository;
    private final RestTemplate restTemplate;

    public ExpiryNotificationService(EsimPurchaseRepository esimPurchaseRepository,
                                     RestTemplate restTemplate) {
        this.esimPurchaseRepository = esimPurchaseRepository;
        this.restTemplate = restTemplate;
    }

    // Runs every day at 8:00 AM UTC
    @Scheduled(cron = "0 0 8 * * *")
    public void checkExpiringPlans() {
        log.info("[Notifications] Running expiry check...");
        List<EsimPurchase> all = esimPurchaseRepository.findAll();
        LocalDate today = LocalDate.now();
        int sent = 0;

        for (EsimPurchase p : all) {
            if (p.getPurchasedAt() == null || p.getValidityDays() == null) continue;

            String pushToken = p.getUser().getPushToken();
            if (pushToken == null || pushToken.isBlank()) continue;

            LocalDate expiry = p.getPurchasedAt().toLocalDate().plusDays(p.getValidityDays());
            long daysLeft = ChronoUnit.DAYS.between(today, expiry);

            if (daysLeft == 3 || daysLeft == 1) {
                String timeStr = daysLeft == 1 ? "tomorrow" : "in 3 days";
                String planLabel = p.getPlanName() != null ? p.getPlanName() : p.getPlanId();
                sendPush(
                    pushToken,
                    "Your eSIM expires " + timeStr + "!",
                    planLabel + " — tap to top up or renew.",
                    Map.of("screen", "my-esims", "planId", p.getPlanId() != null ? p.getPlanId() : "")
                );
                sent++;
            }
        }

        log.info("[Notifications] Expiry check done — {} notification(s) sent.", sent);
    }

    private void sendPush(String token, String title, String body, Map<String, Object> data) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Accept", "application/json");
            headers.set("Accept-Encoding", "gzip, deflate");

            Map<String, Object> payload = new HashMap<>();
            payload.put("to", token);
            payload.put("title", title);
            payload.put("body", body);
            payload.put("data", data);
            payload.put("sound", "default");
            payload.put("channelId", "expiry");
            payload.put("priority", "high");

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            restTemplate.postForEntity(EXPO_PUSH_URL, entity, String.class);
            log.debug("[Notifications] Push sent to token ending ...{}", token.length() > 8 ? token.substring(token.length() - 8) : token);
        } catch (Exception e) {
            log.warn("[Notifications] Push send failed: {}", e.getMessage());
        }
    }
}
