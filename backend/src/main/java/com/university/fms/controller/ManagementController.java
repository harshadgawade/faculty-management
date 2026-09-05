package com.university.fms.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;

/**
 * Functional REST layer for dashboard modules that are represented by the
 * existing relational schema but do not need a large JPA aggregate yet.
 * It keeps Calendar, Tasks, Announcements, Lectures and Payroll persistent.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping
public class ManagementController {

    private final JdbcTemplate jdbc;

    // -------------------- LOOKUPS --------------------
    @GetMapping("/departments")
    public List<Map<String, Object>> departments() {
        return jdbc.queryForList("SELECT id, dept_code AS code, dept_name AS name FROM departments ORDER BY dept_name");
    }

    @GetMapping("/roles")
    public List<Map<String, Object>> roles() {
        return jdbc.queryForList("SELECT id, role_name AS name, description FROM roles ORDER BY id");
    }

    // -------------------- CALENDAR --------------------
    @GetMapping("/calendar")
    public List<Map<String, Object>> calendar(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {
        if (from == null || to == null) {
            return jdbc.queryForList("SELECT id,title,event_type AS eventType,start_datetime AS startDatetime,end_datetime AS endDatetime,department_id AS departmentId,description,is_recurring AS recurring FROM academic_calendar ORDER BY start_datetime LIMIT 500");
        }
        return jdbc.queryForList("SELECT id,title,event_type AS eventType,start_datetime AS startDatetime,end_datetime AS endDatetime,department_id AS departmentId,description,is_recurring AS recurring FROM academic_calendar WHERE start_datetime <= ? AND end_datetime >= ? ORDER BY start_datetime", to, from);
    }

    @PostMapping("/calendar")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','DEAN','HOD')")
    public ResponseEntity<Map<String,Object>> createCalendar(@RequestBody Map<String,Object> body) {
        jdbc.update("INSERT INTO academic_calendar(title,event_type,start_datetime,end_datetime,department_id,is_recurring,description) VALUES(?,?,?,?,?,?,?)",
                text(body,"title"), text(body,"eventType"), LocalDateTime.parse(text(body,"startDatetime").replace("Z","")), LocalDateTime.parse(text(body,"endDatetime").replace("Z","")),
                number(body,"departmentId"), bool(body,"recurring"), text(body,"description"));
        return ResponseEntity.ok(Map.of("message","Event created"));
    }

    @PutMapping("/calendar/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','DEAN','HOD')")
    public ResponseEntity<Map<String,Object>> updateCalendar(@PathVariable Long id, @RequestBody Map<String,Object> body) {
        jdbc.update("UPDATE academic_calendar SET title=?,event_type=?,start_datetime=?,end_datetime=?,department_id=?,is_recurring=?,description=? WHERE id=?",
                text(body,"title"), text(body,"eventType"), LocalDateTime.parse(text(body,"startDatetime").replace("Z","")), LocalDateTime.parse(text(body,"endDatetime").replace("Z","")),
                number(body,"departmentId"), bool(body,"recurring"), text(body,"description"), id);
        return ResponseEntity.ok(Map.of("message","Event updated"));
    }

    @DeleteMapping("/calendar/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','DEAN','HOD')")
    public ResponseEntity<Void> deleteCalendar(@PathVariable Long id) {
        jdbc.update("DELETE FROM academic_calendar WHERE id=?", id);
        return ResponseEntity.noContent().build();
    }

    // -------------------- TASKS --------------------
    @GetMapping("/tasks")
    public List<Map<String,Object>> tasks(@RequestParam(required=false) Long facultyId) {
        if (facultyId == null) {
            return jdbc.queryForList("SELECT t.id,t.faculty_id AS facultyId,t.title,t.description,t.priority,t.status,t.due_date AS dueDate,t.completed_at AS completedAt,CONCAT(f.first_name,' ',f.last_name) AS facultyName FROM tasks t JOIN faculty_details f ON f.id=t.faculty_id ORDER BY t.due_date IS NULL,t.due_date,t.id DESC");
        }
        return jdbc.queryForList("SELECT t.id,t.faculty_id AS facultyId,t.title,t.description,t.priority,t.status,t.due_date AS dueDate,t.completed_at AS completedAt,CONCAT(f.first_name,' ',f.last_name) AS facultyName FROM tasks t JOIN faculty_details f ON f.id=t.faculty_id WHERE t.faculty_id=? ORDER BY t.due_date IS NULL,t.due_date,t.id DESC", facultyId);
    }

    @PostMapping("/tasks")
    public ResponseEntity<Map<String,Object>> createTask(@RequestBody Map<String,Object> body) {
        jdbc.update("INSERT INTO tasks(faculty_id,title,description,priority,status,due_date) VALUES(?,?,?,?,?,?)",
                number(body,"facultyId"), text(body,"title"), text(body,"description"), defaultText(body,"priority","MEDIUM"), defaultText(body,"status","PENDING"), dateOrNull(body,"dueDate"));
        return ResponseEntity.ok(Map.of("message","Task created"));
    }

    @PutMapping("/tasks/{id}")
    public ResponseEntity<Map<String,Object>> updateTask(@PathVariable Long id, @RequestBody Map<String,Object> body) {
        String status = defaultText(body,"status","PENDING");
        jdbc.update("UPDATE tasks SET title=?,description=?,priority=?,status=?,due_date=?,completed_at=? WHERE id=?",
                text(body,"title"), text(body,"description"), defaultText(body,"priority","MEDIUM"), status, dateOrNull(body,"dueDate"),
                "COMPLETED".equals(status) ? new Date() : null, id);
        return ResponseEntity.ok(Map.of("message","Task updated"));
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        jdbc.update("DELETE FROM tasks WHERE id=?", id);
        return ResponseEntity.noContent().build();
    }

    // -------------------- ANNOUNCEMENTS --------------------
    @GetMapping("/announcements")
    public List<Map<String,Object>> announcements() {
        return jdbc.queryForList("SELECT id,title,body,category,target_role AS targetRole,department_id AS departmentId,is_pinned AS pinned,published_at AS publishedAt,expires_at AS expiresAt FROM announcements WHERE expires_at IS NULL OR expires_at >= CURRENT_TIMESTAMP ORDER BY is_pinned DESC,published_at DESC LIMIT 100");
    }

    @PostMapping("/announcements")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','DEAN','HOD')")
    public ResponseEntity<Map<String,Object>> createAnnouncement(@RequestBody Map<String,Object> body) {
        jdbc.update("INSERT INTO announcements(title,body,category,target_role,department_id,is_pinned,expires_at) VALUES(?,?,?,?,?,?,?)",
                text(body,"title"), text(body,"body"), defaultText(body,"category","GENERAL"), text(body,"targetRole"), number(body,"departmentId"), bool(body,"pinned"), timestampOrNull(body,"expiresAt"));
        return ResponseEntity.ok(Map.of("message","Announcement published"));
    }

    @DeleteMapping("/announcements/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','DEAN','HOD')")
    public ResponseEntity<Void> deleteAnnouncement(@PathVariable Long id) {
        jdbc.update("DELETE FROM announcements WHERE id=?", id);
        return ResponseEntity.noContent().build();
    }

    // -------------------- LECTURES --------------------
    @GetMapping("/lectures")
    public List<Map<String,Object>> lectures(@RequestParam(required=false) Long facultyId) {
        if (facultyId == null) {
            return jdbc.queryForList("SELECT l.id,l.faculty_id AS facultyId,l.subject_id AS subjectId,s.subject_code AS subjectCode,s.subject_name AS subjectName,l.lecture_date AS lectureDate,l.punch_in AS punchIn,l.punch_out AS punchOut,l.duration_minutes AS durationMinutes,l.topic_covered AS topicCovered,l.syllabus_percentage AS syllabusPercentage FROM lecture_logs l JOIN subjects s ON s.id=l.subject_id ORDER BY l.lecture_date DESC,l.id DESC LIMIT 100");
        }
        return jdbc.queryForList("SELECT l.id,l.faculty_id AS facultyId,l.subject_id AS subjectId,s.subject_code AS subjectCode,s.subject_name AS subjectName,l.lecture_date AS lectureDate,l.punch_in AS punchIn,l.punch_out AS punchOut,l.duration_minutes AS durationMinutes,l.topic_covered AS topicCovered,l.syllabus_percentage AS syllabusPercentage FROM lecture_logs l JOIN subjects s ON s.id=l.subject_id WHERE l.faculty_id=? ORDER BY l.lecture_date DESC,l.id DESC LIMIT 100", facultyId);
    }

    @PostMapping("/lectures/punch-in")
    public ResponseEntity<Map<String,Object>> lecturePunchIn(@RequestBody Map<String,Object> body) {
        jdbc.update("INSERT INTO lecture_logs(faculty_id,subject_id,lecture_date,punch_in,topic_covered,syllabus_percentage) VALUES(?,?,?,?,?,?)",
                number(body,"facultyId"), number(body,"subjectId"), LocalDate.parse(text(body,"lectureDate")), new Date(), text(body,"topicCovered"), decimal(body,"syllabusPercentage"));
        return ResponseEntity.ok(Map.of("message","Lecture punched in"));
    }

    @PostMapping("/lectures/{id}/punch-out")
    public ResponseEntity<Map<String,Object>> lecturePunchOut(@PathVariable Long id) {
        jdbc.update("UPDATE lecture_logs SET punch_out=? WHERE id=? AND punch_out IS NULL", new Date(), id);
        return ResponseEntity.ok(Map.of("message","Lecture punched out"));
    }

    // -------------------- PAYROLL --------------------
    @GetMapping("/payroll")
    public List<Map<String,Object>> payroll(@RequestParam(required=false) String month) {
        if (month == null || month.isBlank()) {
            return jdbc.queryForList("SELECT p.id,p.faculty_id AS facultyId,CONCAT(f.first_name,' ',f.last_name) AS facultyName,f.employee_code AS employeeCode,p.payroll_month AS payrollMonth,p.gross_salary AS grossSalary,p.net_salary AS netSalary,p.payment_status AS paymentStatus,p.payment_date AS paymentDate,p.slip_generated AS slipGenerated FROM payroll p JOIN faculty_details f ON f.id=p.faculty_id ORDER BY p.payroll_month DESC,p.id DESC LIMIT 200");
        }
        return jdbc.queryForList("SELECT p.id,p.faculty_id AS facultyId,CONCAT(f.first_name,' ',f.last_name) AS facultyName,f.employee_code AS employeeCode,p.payroll_month AS payrollMonth,p.gross_salary AS grossSalary,p.net_salary AS netSalary,p.payment_status AS paymentStatus,p.payment_date AS paymentDate,p.slip_generated AS slipGenerated FROM payroll p JOIN faculty_details f ON f.id=p.faculty_id WHERE p.payroll_month=? ORDER BY f.last_name", LocalDate.parse(month + "-01"));
    }

    @PostMapping("/payroll/run")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','DEAN','HOD')")
    public ResponseEntity<Map<String,Object>> runPayroll(@RequestParam String month) {
        LocalDate payrollMonth = YearMonth.parse(month).atDay(1);
        List<Map<String,Object>> faculty = jdbc.queryForList("SELECT f.id, f.designation FROM faculty_details f JOIN users u ON u.id=f.user_id WHERE u.is_active=1");
        int count = 0;
        for (Map<String,Object> f : faculty) {
            Long id = ((Number)f.get("id")).longValue();
            String designation = Objects.toString(f.get("designation"),"Assistant Professor").toLowerCase();
            String grade = designation.contains("professor") && !designation.contains("associate") && !designation.contains("assistant") ? "PG-PROF" : designation.contains("associate") ? "PG-ASSOC" : designation.contains("guest") ? "PG-GUEST" : "PG-ASST";
            Map<String,Object> g = jdbc.queryForMap("SELECT id,basic_salary,hra_percent,da_percent,ta_fixed,pf_percent FROM payroll_grades WHERE grade_code=?", grade);
            BigDecimal basic = new BigDecimal(g.get("basic_salary").toString());
            BigDecimal hra = basic.multiply(new BigDecimal(g.get("hra_percent").toString())).divide(new BigDecimal("100"));
            BigDecimal da = basic.multiply(new BigDecimal(g.get("da_percent").toString())).divide(new BigDecimal("100"));
            BigDecimal ta = new BigDecimal(g.get("ta_fixed").toString());
            BigDecimal pf = basic.multiply(new BigDecimal(g.get("pf_percent").toString())).divide(new BigDecimal("100"));
            jdbc.update("INSERT INTO payroll(faculty_id,grade_id,payroll_month,basic_salary,hra,da,ta,research_stipend,lecture_allowance,gross_salary,pf_deduction,tds_deduction,lop_deduction,other_deductions,net_salary,payment_status,slip_generated) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE grade_id=VALUES(grade_id),basic_salary=VALUES(basic_salary),hra=VALUES(hra),da=VALUES(da),ta=VALUES(ta),pf_deduction=VALUES(pf_deduction),payment_status='PENDING',slip_generated=0",
                    id, ((Number)g.get("id")).longValue(), payrollMonth, basic, hra, da, ta, BigDecimal.ZERO, BigDecimal.ZERO, basic.add(hra).add(da).add(ta), pf, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, basic.add(hra).add(da).add(ta).subtract(pf), "PENDING", false);
            count++;
        }
        return ResponseEntity.ok(Map.of("message","Payroll generated","records",count,"month",month));
    }

    @PostMapping("/payroll/{id}/mark-paid")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','DEAN','HOD')")
    public ResponseEntity<Map<String,Object>> markPaid(@PathVariable Long id) {
        jdbc.update("UPDATE payroll SET payment_status='PAID',payment_date=CURRENT_DATE,slip_generated=1 WHERE id=?", id);
        return ResponseEntity.ok(Map.of("message","Payroll marked as paid"));
    }

    // -------------------- helpers --------------------
    private static String text(Map<String,Object> b,String k){ Object v=b.get(k); return v==null?null:String.valueOf(v); }
    private static String defaultText(Map<String,Object> b,String k,String d){ String v=text(b,k); return v==null||v.isBlank()?d:v; }
    private static Long number(Map<String,Object> b,String k){ Object v=b.get(k); return v==null?null:((Number)(v instanceof Number?v:Long.valueOf(v.toString()))).longValue(); }
    private static boolean bool(Map<String,Object> b,String k){ Object v=b.get(k); return v instanceof Boolean ? (Boolean)v : "true".equalsIgnoreCase(String.valueOf(v)); }
    private static LocalDate dateOrNull(Map<String,Object> b,String k){ String v=text(b,k); return v==null||v.isBlank()?null:LocalDate.parse(v); }
    private static LocalDateTime timestampOrNull(Map<String,Object> b,String k){ String v=text(b,k); return v==null||v.isBlank()?null:LocalDateTime.parse(v.replace("Z","")); }
    private static BigDecimal decimal(Map<String,Object> b,String k){ String v=text(b,k); return v==null||v.isBlank()?BigDecimal.ZERO:new BigDecimal(v); }
}
