package com.simfinity.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class NetworkCoverageService {

    private static final Logger log = LoggerFactory.getLogger(NetworkCoverageService.class);
    private static final long CACHE_TTL_MS = 30 * 60 * 1000L;

    @Value("${opencellid.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper mapper = new ObjectMapper();

    private record CachedCoverage(Map<String, Object> data, long cachedAt) {}
    private final ConcurrentHashMap<String, CachedCoverage> cache = new ConcurrentHashMap<>();

    public NetworkCoverageService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Map<String, Object> getCoverage(double lat, double lng, double size) {
        String cacheKey = String.format("%.3f,%.3f,%.2f", lat, lng, size);
        CachedCoverage cached = cache.get(cacheKey);
        if (cached != null && System.currentTimeMillis() - cached.cachedAt() < CACHE_TTL_MS) {
            log.debug("[Coverage] Cache hit for {}", cacheKey);
            return cached.data();
        }

        // Cap to ~3.8M sq.m to stay within OpenCellID's 4M sq.m free-tier BBOX limit
        double safeSize = Math.min(size, 0.008);
        double minLat = lat - safeSize;
        double maxLat = lat + safeSize;
        double minLng = lng - safeSize;
        double maxLng = lng + safeSize;

        String url = String.format(
            "https://opencellid.org/cell/getInArea?key=%s&BBOX=%.6f,%.6f,%.6f,%.6f&format=json&limit=200",
            apiKey, minLat, minLng, maxLat, maxLng
        );

        try {
            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = mapper.readTree(response);

            if (root.has("error")) {
                log.warn("[Coverage] OpenCellID error: {} (code {})",
                    root.path("error").asText(), root.path("code").asInt());
                Map<String, Object> err = new HashMap<>();
                err.put("points", List.of());
                err.put("count", 0);
                err.put("centerLat", lat);
                err.put("centerLng", lng);
                return err;
            }

            JsonNode cells = root.path("cells");

            List<Map<String, Object>> points = new ArrayList<>();

            if (cells.isArray()) {
                for (JsonNode cell : cells) {
                    double cellLat = cell.path("lat").asDouble(0);
                    double cellLng = cell.path("lon").asDouble(0);
                    // averageSignal in dBm: -50 excellent → -120 very poor
                    double signal = cell.path("averageSignal").asDouble(-90);
                    int samples = cell.path("samples").asInt(1);
                    String radio = cell.path("radio").asText("LTE");

                    // Normalize to 0-1 weight (0 = poor, 1 = excellent)
                    double weight = Math.max(0.0, Math.min(1.0, (signal + 120.0) / 70.0));

                    Map<String, Object> point = new HashMap<>();
                    point.put("lat", cellLat);
                    point.put("lng", cellLng);
                    point.put("weight", Math.round(weight * 100.0) / 100.0);
                    point.put("signal", (int) signal);
                    point.put("samples", samples);
                    point.put("radio", radio);
                    points.add(point);
                }
            }

            log.info("[Coverage] Fetched {} towers for ({}, {})", points.size(), lat, lng);

            Map<String, Object> result = new HashMap<>();
            result.put("points", points);
            result.put("count", points.size());
            result.put("centerLat", lat);
            result.put("centerLng", lng);

            cache.put(cacheKey, new CachedCoverage(result, System.currentTimeMillis()));
            return result;

        } catch (Exception e) {
            log.warn("[Coverage] OpenCellID API error: {}", e.getMessage());
            Map<String, Object> err = new HashMap<>();
            err.put("points", List.of());
            err.put("count", 0);
            err.put("centerLat", lat);
            err.put("centerLng", lng);
            return err;
        }
    }
}
