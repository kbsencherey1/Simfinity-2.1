package com.simfinity.backend.controller;

import com.simfinity.backend.service.InsightService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class InsightController {

    private final InsightService insightService;

    public InsightController(InsightService insightService) {
        this.insightService = insightService;
    }

    @GetMapping("/local-insight")
    public ResponseEntity<Map<String, Object>> getLocalInsight(
            @RequestParam(required = false) String country) {
        Map<String, Object> result = insightService.getLocalInsight(country);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/akan-proverb")
    public ResponseEntity<Map<String, Object>> getAkanProverb() {
        return ResponseEntity.ok(insightService.getAkanProverb());
    }
}
