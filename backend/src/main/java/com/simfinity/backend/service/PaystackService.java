package com.simfinity.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.simfinity.backend.util.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class PaystackService {

    private static final Logger log = LoggerFactory.getLogger(PaystackService.class);

    @Value("${paystack.secret.key:}")
    private String paystackSecretKey;

    private final RestTemplate restTemplate;
    private final ZenditService zenditService;
    private final ObjectMapper mapper = new ObjectMapper();

    public PaystackService(RestTemplate restTemplate, ZenditService zenditService) {
        this.restTemplate = restTemplate;
        this.zenditService = zenditService;
    }

    public Map<String, Object> initializeTransaction(String email, double amountGhs, String planId) {
        if (paystackSecretKey == null || paystackSecretKey.isBlank()) {
            return simulatedGateway();
        }

        try {
            long amountInKobo = Math.round(amountGhs * 100);

            ObjectNode body = mapper.createObjectNode();
            body.put("email", email);
            body.put("amount", amountInKobo);
            body.put("callback_url", "simfinity://payment-complete");

            ObjectNode metadata = mapper.createObjectNode();
            metadata.put("planId", planId);
            ArrayNode customFields = mapper.createArrayNode();
            ObjectNode field = mapper.createObjectNode();
            field.put("display_name", "Plan Identifier");
            field.put("variable_name", "plan_id");
            field.put("value", planId);
            customFields.add(field);
            metadata.set("custom_fields", customFields);
            body.set("metadata", metadata);

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(paystackSecretKey);
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(mapper.writeValueAsString(body), headers);

            ResponseEntity<JsonNode> response = restTemplate.postForEntity(
                "https://api.paystack.co/transaction/initialize", entity, JsonNode.class);

            JsonNode responseBody = response.getBody();
            if (!response.getStatusCode().is2xxSuccessful() || responseBody == null || !responseBody.path("status").asBoolean()) {
                throw new RuntimeException(responseBody != null ? responseBody.path("message").asText("Failed") : "Failed");
            }

            JsonNode data = responseBody.path("data");
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("authorization_url", data.path("authorization_url").asText());
            result.put("reference", data.path("reference").asText());
            result.put("access_code", data.path("access_code").asText());
            return result;

        } catch (Exception e) {
            log.warn("[Paystack] Sandbox offline or unreachable, falling back: {}", e.getMessage());
            return simulatedGateway();
        }
    }

    public Map<String, Object> verifyPaymentOnly(String reference) {
        // sim_ references are only valid in development (when no live Paystack key is configured)
        if (reference.startsWith("sim_")) {
            if (paystackSecretKey != null && !paystackSecretKey.isBlank()) {
                log.warn("[Paystack] Rejected sim_ reference {} — live key is configured", reference);
                return Map.of("error", "Invalid payment reference.");
            }
            return Map.of("success", true, "reference", reference);
        }
        if (paystackSecretKey != null && !paystackSecretKey.isBlank()) {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setBearerAuth(paystackSecretKey);
                HttpEntity<Void> entity = new HttpEntity<>(headers);
                ResponseEntity<JsonNode> response = restTemplate.exchange(
                    "https://api.paystack.co/transaction/verify/" + reference,
                    HttpMethod.GET, entity, JsonNode.class);
                JsonNode body = response.getBody();
                if (response.getStatusCode().is2xxSuccessful() && body != null
                        && body.path("status").asBoolean()
                        && "success".equals(body.path("data").path("status").asText())) {
                    return Map.of("success", true, "reference", reference);
                }
            } catch (Exception e) {
                log.warn("[Paystack] Verify error: {}", e.getMessage());
            }
            return Map.of("error", "Payment verification failed or pending.");
        }
        return Map.of("error", "Payment verification failed or pending.");
    }

    public Map<String, Object> verifyTransaction(String reference, String planId) {
        boolean paymentSuccessful = false;

        if (reference.startsWith("sim_") && (paystackSecretKey == null || paystackSecretKey.isBlank())) {
            paymentSuccessful = true;
        } else if (paystackSecretKey != null && !paystackSecretKey.isBlank()) {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setBearerAuth(paystackSecretKey);
                HttpEntity<Void> entity = new HttpEntity<>(headers);

                ResponseEntity<JsonNode> response = restTemplate.exchange(
                    "https://api.paystack.co/transaction/verify/" + reference,
                    HttpMethod.GET, entity, JsonNode.class);

                JsonNode body = response.getBody();
                if (response.getStatusCode().is2xxSuccessful() && body != null
                        && body.path("status").asBoolean()
                        && "success".equals(body.path("data").path("status").asText())) {
                    paymentSuccessful = true;
                }
            } catch (Exception e) {
                log.warn("[Paystack] Verify error: {}", e.getMessage());
            }
        }

        if (!paymentSuccessful) {
            return Map.of("error", "Payment verification failed or pending.");
        }

        Map<String, Object> esimProfile = zenditService.provisionEsim(reference, planId);

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("reference", reference);
        result.put("paymentStatus", "success");
        result.put("esim", esimProfile);
        return result;
    }

    private Map<String, Object> simulatedGateway() {
        String simRef = "sim_" + StringUtils.randomAlphaNum(9).toUpperCase();
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("authorization_url", "https://checkout.paystack.com/mock-gateway?ref=" + simRef);
        result.put("reference", simRef);
        result.put("isSimulated", true);
        result.put("message", "Paystack simulated gateway initialized successfully (Failover active)");
        return result;
    }
}
