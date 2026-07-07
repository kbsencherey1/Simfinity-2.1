package com.simfinity.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Sliding-window rate limiter for sensitive auth endpoints.
 * Allows MAX_REQUESTS per IP within WINDOW_MS before returning 429.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int MAX_REQUESTS = 10;
    private static final long WINDOW_MS = 60_000L;

    private record Window(AtomicInteger count, long start) {}
    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();

    private static final java.util.Set<String> RATE_LIMITED_PATHS = java.util.Set.of(
        "/api/auth/login",
        "/api/auth/register",
        "/api/auth/forgot-password",
        "/api/auth/reset-password"
    );

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain chain) throws ServletException, IOException {

        String path = request.getRequestURI();
        if (!RATE_LIMITED_PATHS.contains(path) || !"POST".equalsIgnoreCase(request.getMethod())) {
            chain.doFilter(request, response);
            return;
        }

        String ip = resolveClientIp(request);
        long now = System.currentTimeMillis();

        Window window = windows.compute(ip, (k, w) -> {
            if (w == null || now - w.start() > WINDOW_MS) return new Window(new AtomicInteger(1), now);
            w.count().incrementAndGet();
            return w;
        });

        if (window.count().get() > MAX_REQUESTS) {
            response.setStatus(429);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write("{\"error\":\"Too many requests. Please wait a minute and try again.\"}");
            return;
        }

        chain.doFilter(request, response);
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
