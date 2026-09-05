package com.university.fms.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/health")
    public Map<String, Object> checkHealth() {
        return Map.of(
                "status", "UP",
                "service", "fms-backend",
                "timestamp", Instant.now().toString()
        );
    }
}
