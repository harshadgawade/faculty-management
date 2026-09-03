package com.university.fms.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data @Builder
public class DashboardStatsDto {

    // ── KPI Cards ────────────────────────────────────────────────
    private long   totalFaculty;
    private long   presentToday;
    private long   onLeaveToday;
    private long   pendingLeaves;

    // ── Payroll ──────────────────────────────────────────────────
    private BigDecimal monthlyNetPayroll;
    private BigDecimal totalResearchGrants;

    // ── Attendance chart data (last 7 days) ──────────────────────
    private List<String>  attendanceDates;
    private List<Long>    presentCounts;
    private List<Long>    absentCounts;

    // ── Salary distribution ──────────────────────────────────────
    private Map<String, BigDecimal> salaryByDesignation;

    // ── Department faculty count ─────────────────────────────────
    private Map<String, Long> facultyByDepartment;

    // ── Leave type breakdown (current month) ────────────────────
    private Map<String, Long> leaveBreakdown;
}
