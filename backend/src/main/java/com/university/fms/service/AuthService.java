package com.university.fms.service;

import com.university.fms.dto.AuthRequest;
import com.university.fms.dto.AuthResponse;
import com.university.fms.entity.FacultyDetails;
import com.university.fms.entity.User;
import com.university.fms.exception.BadRequestException;
import com.university.fms.exception.ResourceNotFoundException;
import com.university.fms.repository.FacultyRepository;
import com.university.fms.repository.UserRepository;
import com.university.fms.security.JwtTokenProvider;
import com.university.fms.util.OtpUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Pattern INSTITUTE_EMAIL =
            Pattern.compile(".*(@university\\.edu|@college\\.ac\\.in)$",
                            Pattern.CASE_INSENSITIVE);

    private final UserRepository      userRepository;
    private final FacultyRepository   facultyRepository;
    private final OtpUtil             otpUtil;
    private final JavaMailSender      mailSender;
    private final JwtTokenProvider    jwtProvider;
    private final AuthenticationManager authManager;

    @Value("${app.otp.expiry-seconds:60}")
    private int otpExpirySeconds;

    // ── Step 1: Send OTP ─────────────────────────────────────────
    @Transactional
    public void sendOtp(AuthRequest.SendOtp request) {
        String email = request.getEmail().toLowerCase().trim();

        if (!INSTITUTE_EMAIL.matcher(email).matches()) {
            throw new BadRequestException(
                    "Access restricted to institutional emails (@university.edu / @college.ac.in).");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No registered user found with email: " + email));

        if (!user.isActive()) {
            throw new BadRequestException("Your account is deactivated. Contact the IT Administrator.");
        }

        String otp        = otpUtil.generate();
        LocalDateTime exp = LocalDateTime.now().plusSeconds(otpExpirySeconds);

        userRepository.updateOtp(email, otp, exp);
        dispatchOtpEmail(email, otp);

        log.info("OTP dispatched for user: {}", email);
    }

    // ── Step 2: Verify OTP & Issue JWT ───────────────────────────
    @Transactional
    public AuthResponse verifyOtpAndLogin(AuthRequest.VerifyOtp request) {
        String email = request.getEmail().toLowerCase().trim();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        // Account lock check
        if (user.getLockedUntil() != null &&
                user.getLockedUntil().isAfter(LocalDateTime.now())) {
            throw new BadRequestException("Account locked. Try again after " + user.getLockedUntil());
        }

        // OTP validation
        if (user.getOtpCode() == null ||
                !user.getOtpCode().equals(request.getOtp())) {
            userRepository.incrementFailedLogins(email);
            // Lock after 5 failed attempts
            if (user.getFailedLoginCount() + 1 >= 5) {
                user.setLockedUntil(LocalDateTime.now().plusMinutes(15));
                userRepository.save(user);
            }
            throw new BadRequestException("Invalid OTP. Please try again.");
        }

        if (user.getOtpExpiresAt() == null ||
                user.getOtpExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP has expired. Please request a new one.");
        }

        // Clear OTP, reset counters, update last login
        userRepository.resetLoginState(email, LocalDateTime.now());

        // Build Spring Security auth context (passwordless — OTP already verified)
        Authentication auth = new UsernamePasswordAuthenticationToken(
                user, null, user.getAuthorities());

        String accessToken  = jwtProvider.generateAccessToken(auth);
        String refreshToken = jwtProvider.generateRefreshToken(auth);

        String fullName = facultyRepository.findByUserId(user.getId())
                .map(FacultyDetails::getFullName)
                .orElse(email);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(86400)
                .email(email)
                .role(user.getRole().getRoleName())
                .fullName(fullName)
                .build();
    }

    // ── Private helpers ───────────────────────────────────────────
    private void dispatchOtpEmail(String toEmail, String otp) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(toEmail);
        msg.setSubject("Your Faculty Dashboard Login OTP");
        msg.setText("""
                Dear Faculty Member,

                Your One-Time Password (OTP) for the Faculty Management Dashboard is:

                        %s

                This OTP is valid for %d seconds. Do not share it with anyone.

                If you did not request this, please contact the IT Help Desk immediately.

                Regards,
                University IT Department
                """.formatted(otp, otpExpirySeconds));
        mailSender.send(msg);
    }
}
