package com.university.fms.controller;

import com.university.fms.dto.AuthRequest;
import com.university.fms.dto.AuthResponse;
import com.university.fms.dto.SignupRequest;
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

    @PostMapping("/send-otp")
    public ResponseEntity<Map<String, String>> sendOtp(@Valid @RequestBody AuthRequest.SendOtp request) {
        authService.sendOtp(request);
        return ResponseEntity.ok(Map.of("message", "OTP sent to " + request.getEmail() + ". Valid for 60 seconds."));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(@Valid @RequestBody AuthRequest.VerifyOtp request) {
        return ResponseEntity.ok(authService.verifyOtpAndLogin(request));
    }

    @PostMapping("/signup")
    public ResponseEntity<Map<String, String>> signup(@Valid @RequestBody SignupRequest request) {
        authService.signup(request);
        return ResponseEntity.ok(Map.of("message", "Account created successfully. Please sign in and request an OTP."));
    }
}
