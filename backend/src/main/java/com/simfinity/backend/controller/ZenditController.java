package com.simfinity.backend.controller;

import com.simfinity.backend.service.ZenditService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/zendit")
public class ZenditController {

    private final ZenditService zenditService;

    public ZenditController(ZenditService zenditService) {
        this.zenditService = zenditService;
    }

    @GetMapping("/esims")
    public ResponseEntity<Map<String, Object>> listEsims() {
        return ResponseEntity.ok(zenditService.listEsims());
    }

    @GetMapping("/offers")
    public ResponseEntity<Map<String, Object>> getOffers(
            @RequestParam(defaultValue = "GH") String country) {
        return ResponseEntity.ok(zenditService.getOffers(country));
    }
}
