package com.university.fms.dto;

import com.university.fms.entity.LeaveRequest.LeaveStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class LeaveRequestDto {
    private Long id;

    @NotNull private Long facultyId;
    private String facultyName;

    @NotNull private Long leaveTypeId;
    private String leaveTypeName;

    @NotNull private LocalDate fromDate;
    @NotNull private LocalDate toDate;
    private long totalDays;

    @NotBlank private String reason;

    private LeaveStatus   status;
    private LocalDateTime appliedOn;
    private String        reviewRemarks;
    private String        documentUrl;
}
