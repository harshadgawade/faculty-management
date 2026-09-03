package com.university.fms.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
public class OtpUtil {

    @Value("${app.otp.length:6}")
    private int otpLength;

    private static final SecureRandom RANDOM = new SecureRandom();

    /**
     * Generates a cryptographically-random numeric OTP of configured length.
     */
    public String generate() {
        int upper = (int) Math.pow(10, otpLength);
        int lower = (int) Math.pow(10, otpLength - 1);
        int otp   = lower + RANDOM.nextInt(upper - lower);
        return String.valueOf(otp);
    }
}
