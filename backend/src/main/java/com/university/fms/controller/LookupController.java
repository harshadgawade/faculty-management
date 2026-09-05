package com.university.fms.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class LookupController {
    private final JdbcTemplate jdbc;

    @GetMapping("/leave-types")
    public List<Map<String,Object>> leaveTypes() {
        return jdbc.queryForList("SELECT id,type_code AS code,type_name AS name,max_days_year AS maxDays,is_paid AS paid FROM leave_types ORDER BY id");
    }

    @GetMapping("/subjects")
    public List<Map<String,Object>> subjects() {
        return jdbc.queryForList("SELECT id,subject_code AS code,subject_name AS name,department_id AS departmentId,semester,credits FROM subjects ORDER BY subject_name");
    }
}
