package com.simfinity.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Service
public class ExchangeRateService {

    private static final String CACHE_KEY = "exchangerate:latest";
    private static final long FRESH_MS = 3_600_000L;
    // Stored far longer than the freshness window so a stale-but-real rate is still
    // preferred over the hardcoded static fallback if the rates API is down for a while.
    private static final Duration STORAGE_TTL = Duration.ofDays(30);

    @Value("${exchangerate.api.key:216a42aaeb82152fe649c421}")
    private String apiKey;

    private final RestTemplate restTemplate;
    private final RedisCacheHelper redisCache;
    private final ObjectMapper mapper = new ObjectMapper();

    public ExchangeRateService(RestTemplate restTemplate, RedisCacheHelper redisCache) {
        this.restTemplate = restTemplate;
        this.redisCache = redisCache;
    }

    public Map<String, Double> getRates() {
        Map<String, Object> cached = redisCache.get(CACHE_KEY);
        Map<String, Double> cachedRates = extractRates(cached);

        if (cached != null && cachedRates != null) {
            long fetchedAt = ((Number) cached.get("fetchedAt")).longValue();
            if (System.currentTimeMillis() - fetchedAt < FRESH_MS) {
                return cachedRates;
            }
        }

        try {
            String url = "https://v6.exchangerate-api.com/v6/" + apiKey + "/latest/GHS";
            String json = restTemplate.getForObject(url, String.class);
            JsonNode root = mapper.readTree(json);
            if (!"success".equals(root.path("result").asText())) {
                return getFallback(cachedRates);
            }
            JsonNode rates = root.get("conversion_rates");
            Map<String, Double> result = new HashMap<>();
            rates.fields().forEachRemaining(e -> result.put(e.getKey(), e.getValue().asDouble()));

            Map<String, Object> toStore = new HashMap<>();
            toStore.put("rates", result);
            toStore.put("fetchedAt", System.currentTimeMillis());
            redisCache.put(CACHE_KEY, toStore, STORAGE_TTL);
            return result;
        } catch (Exception e) {
            return getFallback(cachedRates);
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Double> extractRates(Map<String, Object> cached) {
        if (cached == null) return null;
        Object ratesObj = cached.get("rates");
        if (!(ratesObj instanceof Map)) return null;
        Map<String, Double> result = new HashMap<>();
        ((Map<String, Object>) ratesObj).forEach((k, v) -> {
            if (v instanceof Number n) result.put(k, n.doubleValue());
        });
        return result;
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
