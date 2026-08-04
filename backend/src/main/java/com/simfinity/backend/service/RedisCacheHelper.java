package com.simfinity.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Map;

/**
 * Shared JSON get/set over Redis for the app's external-API response caches
 * (Zendit offers, OpenCellID coverage, exchange rates) — one shared cache instead
 * of each service/instance holding its own in-memory copy, so multiple backend
 * instances stay consistent and don't each hammer the same external APIs.
 */
@Component
public class RedisCacheHelper {

    private static final Logger log = LoggerFactory.getLogger(RedisCacheHelper.class);

    private final StringRedisTemplate redis;
    private final ObjectMapper mapper = new ObjectMapper();

    public RedisCacheHelper(StringRedisTemplate redis) {
        this.redis = redis;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> get(String key) {
        try {
            String json = redis.opsForValue().get(key);
            if (json == null) return null;
            return mapper.readValue(json, Map.class);
        } catch (Exception e) {
            log.warn("[RedisCache] Failed to read key {}: {}", key, e.getMessage());
            return null;
        }
    }

    public void put(String key, Map<String, Object> value, Duration ttl) {
        try {
            redis.opsForValue().set(key, mapper.writeValueAsString(value), ttl);
        } catch (Exception e) {
            log.warn("[RedisCache] Failed to write key {}: {}", key, e.getMessage());
        }
    }

    /** Enumerates cache keys matching a glob pattern (e.g. "zendit:offers:*"). */
    public java.util.Set<String> keys(String pattern) {
        try {
            java.util.Set<String> found = redis.keys(pattern);
            return found != null ? found : java.util.Set.of();
        } catch (Exception e) {
            log.warn("[RedisCache] Failed to scan keys for pattern {}: {}", pattern, e.getMessage());
            return java.util.Set.of();
        }
    }

    /**
     * Atomic set-if-absent (Redis SETNX + TTL) — used as a claim/lock so that only one
     * concurrent caller "wins" a given key. Returns true only for the caller that set it.
     * Fails open (returns true) on a Redis error so an outage degrades to the pre-lock
     * behavior rather than blocking the operation outright.
     */
    public boolean setIfAbsent(String key, String value, Duration ttl) {
        try {
            Boolean set = redis.opsForValue().setIfAbsent(key, value, ttl);
            return Boolean.TRUE.equals(set);
        } catch (Exception e) {
            log.warn("[RedisCache] setIfAbsent failed for {}: {}", key, e.getMessage());
            return true;
        }
    }

    public void delete(String key) {
        try {
            redis.delete(key);
        } catch (Exception e) {
            log.warn("[RedisCache] Failed to delete key {}: {}", key, e.getMessage());
        }
    }
}
