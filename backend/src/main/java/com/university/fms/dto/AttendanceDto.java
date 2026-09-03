package com.university.fms.dto;

import com.university.fms.entity.Attendance.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AttendanceDto {
    private Long id;

    @NotNull private Long facultyId;
    @NotNull private LocalDate attendanceDate;
    @NotNull private AttendanceStatus status;

    private LocalTime checkIn;
    private LocalTime checkOut;
    private String    remarks;
}
