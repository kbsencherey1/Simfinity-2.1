package com.simfinity.backend.controller;

import com.simfinity.backend.service.GeminiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class InsightController {

    private final GeminiService geminiService;

    public InsightController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @GetMapping("/local-insight")
    public ResponseEntity<Map<String, Object>> getLocalInsight(
            @RequestParam(required = false) String country) {
        Map<String, Object> result = geminiService.getLocalInsight(country);
        return ResponseEntity.ok(result);
    }
}
