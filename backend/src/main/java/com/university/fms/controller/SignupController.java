package com.university.fms.controller;

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
        Long departmentId = number(b,"departmentId");
        if (!INSTITUTE_EMAIL.matcher(email).matches()) throw new IllegalArgumentException("Use @university.edu or @college.ac.in email.");
        if (first.isBlank() || last.isBlank() || departmentId == null) throw new IllegalArgumentException("Name and department are required.");
        if (jdbc.queryForObject("SELECT COUNT(*) FROM users WHERE email=?", Integer.class, email) > 0) throw new IllegalArgumentException("Account already exists. Use Sign In.");
        Integer deptCount = jdbc.queryForObject("SELECT COUNT(*) FROM departments WHERE id=?", Integer.class, departmentId);
        if (deptCount == null || deptCount == 0) throw new IllegalArgumentException("Selected department was not found.");
        Long roleId = jdbc.queryForObject("SELECT id FROM roles WHERE role_name NOT IN ('SUPER_ADMIN','DEAN','HOD') ORDER BY id LIMIT 1", Long.class);
        if (roleId == null) throw new IllegalStateException("No faculty role is configured.");
        String passwordHash = passwordEncoder.encode(java.util.UUID.randomUUID().toString());
        jdbc.update("INSERT INTO users(email,password_hash,role_id,is_active,is_email_verified,preferred_language) VALUES(?,?,?,1,0,'en')", email,passwordHash,roleId);
        Long userId = jdbc.queryForObject("SELECT id FROM users WHERE email=?", Long.class, email);
        String employeeCode = "NEW-" + userId;
        jdbc.update("INSERT INTO faculty_details(user_id,department_id,employee_code,first_name,last_name,designation,date_of_joining) VALUES(?,?,?,?,?,?,?)",
                userId,departmentId,employeeCode,first,last,"Assistant Professor", LocalDate.now());
        return ResponseEntity.ok(Map.of("message","Account created. Now use Sign In to receive your OTP.","email",email));
    }

    private static String text(Map<String,Object> b,String k){ Object v=b.get(k); return v==null?"":String.valueOf(v); }
    private static Long number(Map<String,Object> b,String k){ Object v=b.get(k); if(v==null||String.valueOf(v).isBlank()) return null; return v instanceof Number n?n.longValue():Long.valueOf(String.valueOf(v)); }
}
