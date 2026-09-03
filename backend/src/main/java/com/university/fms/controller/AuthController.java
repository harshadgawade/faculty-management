package com.university.fms.controller;

import com.university.fms.dto.AuthRequest;
import com.university.fms.dto.AuthResponse;
import com.university.fms.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/auth/send-otp
     * Body: { "email": "faculty@university.edu" }
     */
    @PostMapping("/send-otp")
    public ResponseEntity<Map<String, String>> sendOtp(
            @Valid @RequestBody AuthRequest.SendOtp request) {

        authService.sendOtp(request);
        return ResponseEntity.ok(Map.of(
                "message", "OTP sent to " + request.getEmail() + ". Valid for 60 seconds."));
    }

    /**
     * POST /api/auth/verify-otp
     * Body: { "email": "faculty@university.edu", "otp": "123456" }
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(
            @Valid @RequestBody AuthRequest.VerifyOtp request) {

        AuthResponse response = authService.verifyOtpAndLogin(request);
        return ResponseEntity.ok(response);
    }
}
