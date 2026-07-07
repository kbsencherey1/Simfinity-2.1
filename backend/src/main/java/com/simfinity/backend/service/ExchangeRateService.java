package com.simfinity.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;

@Service
public class ExchangeRateService {

    @Value("${exchangerate.api.key:216a42aaeb82152fe649c421}")
    private String apiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper mapper = new ObjectMapper();
    private final AtomicReference<Map<String, Double>> cachedRates = new AtomicReference<>();
    private final AtomicLong cacheExpiry = new AtomicLong(0);

    public ExchangeRateService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Map<String, Double> getRates() {
        long now = System.currentTimeMillis();
        Map<String, Double> cached = cachedRates.get();
        if (cached != null && now < cacheExpiry.get()) {
            return cached;
        }
        try {
            String url = "https://v6.exchangerate-api.com/v6/" + apiKey + "/latest/GHS";
            String json = restTemplate.getForObject(url, String.class);
            JsonNode root = mapper.readTree(json);
            if (!"success".equals(root.path("result").asText())) {
                return getFallback(cached);
            }
            JsonNode rates = root.get("conversion_rates");
            Map<String, Double> result = new HashMap<>();
            rates.fields().forEachRemaining(e -> result.put(e.getKey(), e.getValue().asDouble()));
            cachedRates.set(result);
            cacheExpiry.set(now + 3_600_000L);
            return result;
        } catch (Exception e) {
            return getFallback(cached);
        }
    }

    private Map<String, Double> getFallback(Map<String, Double> existing) {
        if (existing != null) return existing;
        Map<String, Double> fb = new HashMap<>();
        fb.put("GHS", 1.0);
        fb.put("USD", 0.065);
        fb.put("EUR", 0.059);
        fb.put("GBP", 0.051);
        fb.put("NGN", 102.0);
        fb.put("KES", 8.4);
        fb.put("ZAR", 1.18);
        fb.put("JPY", 9.7);
        fb.put("CAD", 0.088);
        fb.put("AUD", 0.10);
        return fb;
    }
}
