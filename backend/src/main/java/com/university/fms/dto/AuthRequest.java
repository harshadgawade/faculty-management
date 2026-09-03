package com.university.fms.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

public class AuthRequest {

    @Data
    public static class SendOtp {
        @NotBlank @Email
        private String email;
    }

    @Data
    public static class VerifyOtp {
        @NotBlank @Email
        private String email;

        @NotBlank
        private String otp;
    }
}
