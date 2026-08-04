package com.simfinity.backend.controller;

import com.simfinity.backend.service.NetworkCoverageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/network")
public class NetworkCoverageController {

    private final NetworkCoverageService networkCoverageService;

    public NetworkCoverageController(NetworkCoverageService networkCoverageService) {
        this.networkCoverageService = networkCoverageService;
    }

    @GetMapping("/coverage")
    public ResponseEntity<Map<String, Object>> getCoverage(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "0.2") double size,
            @RequestParam(required = false) List<String> networks) {
        return ResponseEntity.ok(networkCoverageService.getCoverage(lat, lng, size, networks));
    }
}
