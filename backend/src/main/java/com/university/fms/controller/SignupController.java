package com.university.fms.controller;

import com.university.fms.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Map;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class SignupController {
    private static final Pattern INSTITUTE_EMAIL = Pattern.compile(".*(@university\\.edu|@college\\.ac\\.in)$", Pattern.CASE_INSENSITIVE);
    private final JdbcTemplate jdbc;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/signup")
    @Transactional
    public ResponseEntity<Map<String,Object>> signup(@RequestBody Map<String,Object> b) {
        String email = text(b,"email").toLowerCase().trim();
        String first = text(b,"firstName").trim();
        String last = text(b,"lastName").trim();
        String requestedRole = text(b,"role").trim().toUpperCase();
        String departmentCode = text(b,"departmentCode").trim().toUpperCase();
        if (!INSTITUTE_EMAIL.matcher(email).matches()) throw new BadRequestException("Use @university.edu or @college.ac.in email.");
        if (first.isBlank() || last.isBlank() || departmentCode.isBlank()) throw new BadRequestException("Name and department are required.");
        if (!requestedRole.equals("STUDENT") && !requestedRole.equals("TEACHER") && !requestedRole.equals("FACULTY")) {
            throw new BadRequestException("Select Student, Teacher or Faculty.");
        }
        Integer exists = jdbc.queryForObject("SELECT COUNT(*) FROM users WHERE email=?", Integer.class, email);
        if (exists != null && exists > 0) throw new BadRequestException("Account already exists. Use Sign In.");
        Long departmentId;
        try {
            departmentId = jdbc.queryForObject("SELECT id FROM departments WHERE UPPER(dept_code)=? LIMIT 1", Long.class, departmentCode);
        } catch (Exception e) {
            departmentId = null;
        }
        if (departmentId == null) throw new BadRequestException("Selected department was not found. Please refresh and select a department.");

        Long roleId = jdbc.queryForObject("SELECT id FROM roles WHERE UPPER(role_name)=? LIMIT 1", Long.class, requestedRole);
        if (roleId == null) throw new BadRequestException("The " + requestedRole + " role is not configured in the database.");

        String passwordHash = passwordEncoder.encode(java.util.UUID.randomUUID().toString());
        jdbc.update("INSERT INTO users(email,password_hash,role_id,is_active,is_email_verified,preferred_language) VALUES(?,?,?,1,0,'en')", email,passwordHash,roleId);
        Long userId = jdbc.queryForObject("SELECT id FROM users WHERE email=?", Long.class, email);
        String employeeCode = "NEW-" + userId;

        jdbc.update("INSERT INTO faculty_details(user_id,department_id,employee_code,first_name,last_name,designation,date_of_joining) VALUES(?,?,?,?,?,?,?)",
                userId,departmentId,employeeCode,first,last,
                requestedRole.equals("STUDENT") ? "Student" : requestedRole.equals("TEACHER") ? "Teacher" : "Faculty",
                LocalDate.now());
        return ResponseEntity.ok(Map.of("message","Account created as " + requestedRole + ". Now use Sign In and select the same role to receive your OTP.","email",email,"role",requestedRole));
    }

    private static String text(Map<String,Object> b,String k){ Object v=b.get(k); return v==null?"":String.valueOf(v); }
}
