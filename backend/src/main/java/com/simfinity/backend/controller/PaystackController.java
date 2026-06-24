package com.simfinity.backend.controller;

import com.simfinity.backend.service.PaystackService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/paystack")
public class PaystackController {

    private final PaystackService paystackService;

    public PaystackController(PaystackService paystackService) {
        this.paystackService = paystackService;
    }

    @PostMapping("/initialize")
    public ResponseEntity<Map<String, Object>> initialize(@RequestBody Map<String, Object> body) {
        String email = (String) body.get("email");
        Object amountObj = body.get("amountGhs");
        String planId = (String) body.getOrDefault("planId", "gold_coast_monthly");

        if (email == null || amountObj == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and amountGhs are required variables."));
        }

        double amountGhs = amountObj instanceof Number n ? n.doubleValue()
            : Double.parseDouble(amountObj.toString());

        Map<String, Object> result = paystackService.initializeTransaction(email, amountGhs, planId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/verify/{reference}")
    public ResponseEntity<Map<String, Object>> verify(
            @PathVariable String reference,
            @RequestParam(defaultValue = "gold_coast_monthly") String planId,
            @RequestParam(defaultValue = "misfitgem6@gmail.com") String email,
            @RequestParam(defaultValue = "5") int dataGb) {

        Map<String, Object> result = paystackService.verifyTransaction(reference, planId, email, dataGb);

        if (result.containsKey("error")) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }
}
