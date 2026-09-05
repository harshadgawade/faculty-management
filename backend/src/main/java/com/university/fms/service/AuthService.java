package com.university.fms.service;

import com.university.fms.dto.AuthRequest;
import com.university.fms.dto.AuthResponse;
import com.university.fms.dto.SignupRequest;
import com.university.fms.entity.Department;
import com.university.fms.entity.FacultyDetails;
import com.university.fms.entity.Role;
import com.university.fms.entity.User;
import com.university.fms.exception.BadRequestException;
import com.university.fms.exception.ResourceNotFoundException;
import com.university.fms.repository.DepartmentRepository;
import com.university.fms.repository.FacultyRepository;
import com.university.fms.repository.RoleRepository;
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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Pattern INSTITUTE_EMAIL = Pattern.compile(".*(@university\\.edu|@college\\.ac\\.in)$", Pattern.CASE_INSENSITIVE);

    private final UserRepository userRepository;
    private final FacultyRepository facultyRepository;
    private final DepartmentRepository departmentRepository;
    private final RoleRepository roleRepository;
    private final OtpUtil otpUtil;
    private final JavaMailSender mailSender;
    private final JwtTokenProvider jwtProvider;
    private final AuthenticationManager authManager;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.otp.expiry-seconds:60}") private int otpExpirySeconds;
    @Value("${RESEND_API_KEY:}") private String resendApiKey;
    @Value("${MAIL_FROM:noreply@university.edu}") private String mailFrom;

    @Transactional
    public void sendOtp(AuthRequest.SendOtp request) {
        String email = normalizeEmail(request.getEmail());
        validateInstitutionEmail(email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No registered user found with email: " + email));
        if (!user.isActive()) throw new BadRequestException("Your account is deactivated. Contact the IT Administrator.");

        String otp = otpUtil.generate();
        LocalDateTime exp = LocalDateTime.now().plusSeconds(otpExpirySeconds);
        userRepository.updateOtp(email, otp, exp);
        dispatchOtpEmail(email, otp);
    }

    @Transactional
    public void signup(SignupRequest request) {
        String email = normalizeEmail(request.getEmail());
        validateInstitutionEmail(email);
        if (userRepository.existsByEmail(email)) throw new BadRequestException("An account already exists with this email.");

        String roleName = normalizeRole(request.getRole());
        Role role = roleRepository.findByRoleName(roleName)
                .orElseThrow(() -> new BadRequestException("Role is not configured: " + roleName));
        Department department = departmentRepository.findByDeptCode(request.getDepartmentCode().trim().toUpperCase(Locale.ROOT))
                .orElseThrow(() -> new BadRequestException("Invalid department selected."));

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                .role(role)
                .isActive(true)
                .isEmailVerified(false)
                .preferredLanguage("en")
                .build();
        user = userRepository.save(user);

        if (roleName.equals("FACULTY") || roleName.equals("TEACHER")) {
            FacultyDetails faculty = FacultyDetails.builder()
                    .user(user)
                    .department(department)
                    .employeeCode(generateEmployeeCode())
                    .firstName(request.getFirstName().trim())
                    .lastName(request.getLastName().trim())
                    .designation(roleName.equals("FACULTY") ? "Faculty" : "Teacher")
                    .dateOfJoining(LocalDate.now())
                    .build();
            facultyRepository.save(faculty);
        }
    }

    @Transactional
    public AuthResponse verifyOtpAndLogin(AuthRequest.VerifyOtp request) {
        String email = normalizeEmail(request.getEmail());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(LocalDateTime.now()))
            throw new BadRequestException("Account temporarily locked. Please try again later.");

        if (user.getOtpCode() == null || !user.getOtpCode().equals(request.getOtp())) {
            userRepository.incrementFailedLogins(email);
            if (user.getFailedLoginCount() + 1 >= 5) {
                user.setLockedUntil(LocalDateTime.now().plusMinutes(15));
                userRepository.save(user);
            }
            throw new BadRequestException("Invalid OTP. Please try again.");
        }
        if (user.getOtpExpiresAt() == null || user.getOtpExpiresAt().isBefore(LocalDateTime.now()))
            throw new BadRequestException("OTP has expired. Please request a new one.");

        user.setEmailVerified(true);
        userRepository.resetLoginState(email, LocalDateTime.now());

        Authentication auth = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
        String accessToken = jwtProvider.generateAccessToken(auth);
        String refreshToken = jwtProvider.generateRefreshToken(auth);
        String fullName = facultyRepository.findByUserId(user.getId()).map(FacultyDetails::getFullName).orElse(email);

        return AuthResponse.builder().accessToken(accessToken).refreshToken(refreshToken).tokenType("Bearer")
                .expiresIn(86400).email(email).role(user.getRole().getRoleName()).fullName(fullName).build();
    }

    private void dispatchOtpEmail(String toEmail, String otp) {
        String subject = "Your Faculty Management System OTP";
        String text = "Your OTP is " + otp + ". It is valid for " + otpExpirySeconds + " seconds. Do not share it with anyone.";

        try {
            if (resendApiKey != null && !resendApiKey.isBlank()) {
                String json = "{\"from\":\"" + escapeJson(mailFrom) + "\",\"to\":[\"" + escapeJson(toEmail) + "\"],\"subject\":\"" + escapeJson(subject) + "\",\"text\":\"" + escapeJson(text) + "\"}";
                HttpRequest req = HttpRequest.newBuilder(URI.create("https://api.resend.com/emails"))
                        .header("Authorization", "Bearer " + resendApiKey)
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(json)).build();
                HttpResponse<String> response = HttpClient.newHttpClient().send(req, HttpResponse.BodyHandlers.ofString());
                if (response.statusCode() / 100 != 2) throw new IllegalStateException("Email provider rejected the request");
                return;
            }

            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(mailFrom);
            msg.setTo(toEmail);
            msg.setSubject(subject);
            msg.setText(text);
            mailSender.send(msg);
        } catch (Exception e) {
            log.error("Unable to send OTP email", e);
            throw new BadRequestException("OTP could not be sent. Please check the email service configuration.");
        }
    }

    private String normalizeEmail(String email) { return email == null ? "" : email.trim().toLowerCase(Locale.ROOT); }
    private void validateInstitutionEmail(String email) {
        if (!INSTITUTE_EMAIL.matcher(email).matches()) throw new BadRequestException("Use @university.edu or @college.ac.in email.");
    }
    private String normalizeRole(String role) {
        String r = role == null ? "" : role.trim().toUpperCase(Locale.ROOT);
        if (r.equals("TEACHER")) return "TEACHER";
        if (r.equals("FACULTY")) return "FACULTY";
        if (r.equals("STUDENT")) return "STUDENT";
        throw new BadRequestException("Invalid account type.");
    }
    private String generateEmployeeCode() { return "FMS-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase(Locale.ROOT); }
    private String escapeJson(String value) { return value.replace("\\", "\\\\").replace("\"", "\\\""); }
}
