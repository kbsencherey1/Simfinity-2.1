package com.simfinity.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class NetworkCoverageService {

    private static final Logger log = LoggerFactory.getLogger(NetworkCoverageService.class);
    private static final Duration CACHE_TTL = Duration.ofMinutes(30);

    @Value("${opencellid.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate;
    private final RedisCacheHelper redisCache;
    private final ObjectMapper mapper = new ObjectMapper();

    // Known MCC -> (MNC -> real carrier brand), matching the exact brand strings Zendit's
    // roaming/networks data returns (e.g. "MTN Ghana"), so plan networks can be matched to towers.
    // Only Ghana (620) is populated today; other countries show all towers unfiltered.
    private static final Map<Integer, Map<Integer, String>> MNC_BRANDS = Map.of(
        620, Map.ofEntries(
            Map.entry(1, "MTN Ghana"),
            Map.entry(2, "Vodafone Ghana"),
            Map.entry(3, "AirtelTigo"),
            Map.entry(6, "AirtelTigo"),
            Map.entry(7, "Glo Ghana")
        )
    );

    public NetworkCoverageService(RestTemplate restTemplate, RedisCacheHelper redisCache) {
        this.restTemplate = restTemplate;
        this.redisCache = redisCache;
    }

    public Map<String, Object> getCoverage(double lat, double lng, double size, List<String> networks) {
        List<String> wantedList = networks == null ? List.of()
            : networks.stream().filter(n -> n != null && !n.isBlank()).toList();
        Set<String> wantedNetworks = wantedList.stream().map(String::toLowerCase).collect(Collectors.toSet());

        String cacheKey = "coverage:" + String.format("%.3f,%.3f,%.2f,%s", lat, lng, size,
            wantedList.isEmpty() ? "" : String.join(",", wantedNetworks));
        Map<String, Object> cached = redisCache.get(cacheKey);
        if (cached != null) {
            log.debug("[Coverage] Cache hit for {}", cacheKey);
            return cached;
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
                return emptyResult(lat, lng);
            }

            JsonNode cells = root.path("cells");
            List<Map<String, Object>> points = new ArrayList<>();
            boolean networkFilterAvailable = false;

            if (cells.isArray()) {
                for (JsonNode cell : cells) {
                    double cellLat = cell.path("lat").asDouble(0);
                    double cellLng = cell.path("lon").asDouble(0);
                    // averageSignalStrength in dBm: -50 excellent -> -120 very poor. 0/absent means unmeasured.
                    double rawSignal = cell.path("averageSignalStrength").asDouble(0);
                    double signal = rawSignal != 0 ? rawSignal : -90;
                    int samples = cell.path("samples").asInt(1);
                    String radio = cell.path("radio").asText("LTE");
                    int mcc = cell.path("mcc").asInt(0);
                    int mnc = cell.path("mnc").asInt(-1);

                    Map<Integer, String> brandsForCountry = MNC_BRANDS.get(mcc);
                    String network = brandsForCountry != null ? brandsForCountry.get(mnc) : null;
                    if (brandsForCountry != null) networkFilterAvailable = true;

                    // Only filter cells whose carrier we can actually identify — never silently
                    // drop towers in countries we haven't mapped MNCs for.
                    if (!wantedNetworks.isEmpty() && brandsForCountry != null) {
                        if (network == null || !wantedNetworks.contains(network.toLowerCase())) continue;
                    }

                    // Normalize to 0-1 weight (0 = poor, 1 = excellent)
                    double weight = Math.max(0.0, Math.min(1.0, (signal + 120.0) / 70.0));

                    Map<String, Object> point = new HashMap<>();
                    point.put("lat", cellLat);
                    point.put("lng", cellLng);
                    point.put("weight", Math.round(weight * 100.0) / 100.0);
                    point.put("signal", (int) signal);
                    point.put("samples", samples);
                    point.put("radio", radio);
                    point.put("network", network);
                    points.add(point);
                }
            }

            log.info("[Coverage] Fetched {} towers for ({}, {}){}", points.size(), lat, lng,
                wantedNetworks.isEmpty() ? "" : " filtered to " + wantedNetworks);

            Map<String, Object> result = new HashMap<>();
            result.put("points", points);
            result.put("count", points.size());
            result.put("centerLat", lat);
            result.put("centerLng", lng);
            result.put("networkFilterAvailable", networkFilterAvailable);

            redisCache.put(cacheKey, result, CACHE_TTL);
            return result;

        } catch (Exception e) {
            log.warn("[Coverage] OpenCellID API error: {}", e.getMessage());
            return emptyResult(lat, lng);
        }
    }

    private Map<String, Object> emptyResult(double lat, double lng) {
        Map<String, Object> err = new HashMap<>();
        err.put("points", List.of());
        err.put("count", 0);
        err.put("centerLat", lat);
        err.put("centerLng", lng);
        err.put("networkFilterAvailable", false);
        return err;
    }
}
