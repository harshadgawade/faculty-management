package com.university.fms.service;

import com.university.fms.dto.DashboardStatsDto;
import com.university.fms.entity.Attendance.AttendanceStatus;
import com.university.fms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final FacultyRepository    facultyRepo;
    private final AttendanceRepository attendanceRepo;
    private final LeaveRequestRepository leaveRepo;
    private final PayrollService       payrollService;
    private final DepartmentRepository deptRepo;

    @Transactional(readOnly = true)
    public DashboardStatsDto getStats() {

        LocalDate today      = LocalDate.now();
        LocalDate monthStart = today.withDayOfMonth(1);
        LocalDate monthEnd   = today.withDayOfMonth(today.lengthOfMonth());

        // ── KPI counts ────────────────────────────────────────────
        long totalFaculty = facultyRepo.count();

        long presentToday = attendanceRepo.countByStatus(
                null, AttendanceStatus.PRESENT, today, today);  // simplified — all faculty

        long onLeaveToday = attendanceRepo.countByStatus(
                null, AttendanceStatus.ON_DUTY, today, today);

        long pendingLeaves = leaveRepo.findByStatus(
                com.university.fms.entity.LeaveRequest.LeaveStatus.PENDING,
                org.springframework.data.domain.Pageable.unpaged()).getTotalElements();

        // ── Payroll ───────────────────────────────────────────────
        var netPayroll     = payrollService.monthlyNetPayroll(monthStart);

        // ── Last 7-day attendance trend ────────────────────────────
        List<String> dates   = new ArrayList<>();
        List<Long>   present = new ArrayList<>();
        List<Long>   absent  = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            dates.add(d.toString());
            present.add(attendanceRepo.countByStatus(null, AttendanceStatus.PRESENT, d, d));
            absent.add(attendanceRepo.countByStatus(null, AttendanceStatus.ABSENT, d, d));
        }

        // ── Department faculty count ──────────────────────────────
        Map<String, Long> byDept = new LinkedHashMap<>();
        deptRepo.findAll().forEach(dept ->
                byDept.put(dept.getDeptCode(), facultyRepo.countByDepartment(dept.getId())));

        return DashboardStatsDto.builder()
                .totalFaculty(totalFaculty)
                .presentToday(presentToday)
                .onLeaveToday(onLeaveToday)
                .pendingLeaves(pendingLeaves)
                .monthlyNetPayroll(netPayroll)
                .attendanceDates(dates)
                .presentCounts(present)
                .absentCounts(absent)
                .facultyByDepartment(byDept)
                .build();
    }
}
