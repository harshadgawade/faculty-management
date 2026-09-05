package com.university.fms.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
public class ProfileController {
    private final JdbcTemplate jdbc;

    @GetMapping
    public ResponseEntity<Map<String,Object>> getProfile(Authentication auth) {
        return ResponseEntity.ok(jdbc.queryForMap("""
            SELECT u.id AS userId,u.email,u.preferred_language AS preferredLanguage,r.role_name AS role,
                   f.id AS facultyId,f.employee_code AS employeeCode,f.first_name AS firstName,f.last_name AS lastName,
                   f.department_id AS departmentId,d.dept_code AS departmentCode,d.dept_name AS departmentName,
                   f.designation,f.qualification,f.specialisation,f.date_of_joining AS dateOfJoining,
                   f.date_of_birth AS dateOfBirth,f.gender,f.contact_number AS contactNumber,
                   f.alternate_email AS alternateEmail,f.address,f.photo_url AS photoUrl,
                   f.experience_years AS experienceYears,f.publications_count AS publicationsCount,
                   f.patents_count AS patentsCount
            FROM users u JOIN roles r ON r.id=u.role_id
            LEFT JOIN faculty_details f ON f.user_id=u.id
            LEFT JOIN departments d ON d.id=f.department_id
            WHERE u.email=?
            """, auth.getName()));
    }

    @PutMapping
    public ResponseEntity<Map<String,Object>> updateProfile(Authentication auth, @RequestBody Map<String,Object> b) {
        String email = auth.getName();
        Long userId = jdbc.queryForObject("SELECT id FROM users WHERE email=?", Long.class, email);
        jdbc.update("UPDATE users SET preferred_language=? WHERE id=?",
                text(b,"preferredLanguage","en"), userId);
        jdbc.update("""
            UPDATE faculty_details SET first_name=?,last_name=?,designation=?,qualification=?,specialisation=?,
            date_of_birth=?,contact_number=?,alternate_email=?,address=?,experience_years=?,publications_count=?,patents_count=?
            WHERE user_id=?
            """,
            text(b,"firstName",null), text(b,"lastName",null), text(b,"designation",null), text(b,"qualification",null),
            text(b,"specialisation",null), date(b,"dateOfBirth"), text(b,"contactNumber",null), text(b,"alternateEmail",null),
            text(b,"address",null), decimal(b,"experienceYears",0), integer(b,"publicationsCount",0), integer(b,"patentsCount",0), userId);
        return ResponseEntity.ok(Map.of("message","Profile updated"));
    }

    private static String text(Map<String,Object> b,String k,String d){ Object v=b.get(k); return v==null?d:String.valueOf(v); }
    private static java.sql.Date date(Map<String,Object> b,String k){ String v=text(b,k,null); return v==null||v.isBlank()?null:java.sql.Date.valueOf(v); }
    private static java.math.BigDecimal decimal(Map<String,Object> b,String k,double d){ String v=text(b,k,null); return v==null||v.isBlank()?java.math.BigDecimal.valueOf(d):new java.math.BigDecimal(v); }
    private static int integer(Map<String,Object> b,String k,int d){ String v=text(b,k,null); return v==null||v.isBlank()?d:Integer.parseInt(v); }
}
