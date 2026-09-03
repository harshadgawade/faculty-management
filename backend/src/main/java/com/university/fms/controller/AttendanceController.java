package com.university.fms.controller;

import com.university.fms.dto.AttendanceDto;
import com.university.fms.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    /** POST /api/attendance */
    @PostMapping
    public ResponseEntity<AttendanceDto> mark(@Valid @RequestBody AttendanceDto dto) {
        return ResponseEntity.ok(attendanceService.markAttendance(dto));
    }

    /** PUT /api/attendance/{id} */
    @PutMapping("/{id}")
    public ResponseEntity<AttendanceDto> update(@PathVariable Long id,
                                                 @Valid @RequestBody AttendanceDto dto) {
        return ResponseEntity.ok(attendanceService.updateAttendance(id, dto));
    }

    /**
     * GET /api/attendance/monthly?facultyId=5&year=2025&month=9
     */
    @GetMapping("/monthly")
    public ResponseEntity<List<AttendanceDto>> monthly(
            @RequestParam Long  facultyId,
            @RequestParam int   year,
            @RequestParam int   month) {

        return ResponseEntity.ok(
                attendanceService.getMonthlyAttendance(facultyId, year, month));
    }
}
