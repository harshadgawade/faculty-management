package com.university.fms.service;

import com.university.fms.dto.LeaveRequestDto;
import com.university.fms.entity.FacultyDetails;
import com.university.fms.entity.LeaveRequest;
import com.university.fms.entity.LeaveRequest.LeaveStatus;
import com.university.fms.entity.LeaveType;
import com.university.fms.entity.User;
import com.university.fms.exception.BadRequestException;
import com.university.fms.exception.ResourceNotFoundException;
import com.university.fms.repository.FacultyRepository;
import com.university.fms.repository.LeaveRequestRepository;
import com.university.fms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveRequestRepository leaveRepo;
    private final FacultyRepository      facultyRepo;
    private final UserRepository         userRepo;

    @Transactional
    public LeaveRequestDto applyLeave(LeaveRequestDto dto) {
        FacultyDetails faculty = facultyRepo.findById(dto.getFacultyId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty", dto.getFacultyId()));

        if (dto.getFromDate().isAfter(dto.getToDate())) {
            throw new BadRequestException("From date cannot be after To date.");
        }

        // Check quota
        int used = leaveRepo.countApprovedDays(
                dto.getFacultyId(), dto.getLeaveTypeId(),
                dto.getFromDate().getYear());
        LeaveType lt = LeaveType.builder().id(dto.getLeaveTypeId()).build();
        // quota enforcement could be expanded here

        LeaveRequest entity = LeaveRequest.builder()
                .faculty(faculty)
                .leaveType(lt)
                .fromDate(dto.getFromDate())
                .toDate(dto.getToDate())
                .reason(dto.getReason())
                .documentUrl(dto.getDocumentUrl())
                .status(LeaveStatus.PENDING)
                .build();

        return toDto(leaveRepo.save(entity));
    }

    @Transactional
    public LeaveRequestDto reviewLeave(Long id, boolean approve,
                                        String remarks, Long reviewerUserId) {
        LeaveRequest entity = leaveRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest", id));

        if (entity.getStatus() != LeaveStatus.PENDING) {
            throw new BadRequestException("Leave request already " + entity.getStatus());
        }

        User reviewer = userRepo.findById(reviewerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", reviewerUserId));

        entity.setStatus(approve ? LeaveStatus.APPROVED : LeaveStatus.REJECTED);
        entity.setReviewedBy(reviewer);
        entity.setReviewedOn(LocalDateTime.now());
        entity.setReviewRemarks(remarks);

        return toDto(leaveRepo.save(entity));
    }

    @Transactional(readOnly = true)
    public Page<LeaveRequestDto> getByFaculty(Long facultyId, Pageable pageable) {
        return leaveRepo.findByFacultyId(facultyId, pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<LeaveRequestDto> getPending(Pageable pageable) {
        return leaveRepo.findByStatus(LeaveStatus.PENDING, pageable).map(this::toDto);
    }

    private LeaveRequestDto toDto(LeaveRequest e) {
        LeaveRequestDto dto = new LeaveRequestDto();
        dto.setId(e.getId());
        dto.setFacultyId(e.getFaculty().getId());
        dto.setFacultyName(e.getFaculty().getFullName());
        dto.setLeaveTypeId(e.getLeaveType().getId());
        dto.setLeaveTypeName(e.getLeaveType().getTypeName());
        dto.setFromDate(e.getFromDate());
        dto.setToDate(e.getToDate());
        dto.setTotalDays(e.getTotalDays());
        dto.setReason(e.getReason());
        dto.setStatus(e.getStatus());
        dto.setAppliedOn(e.getAppliedOn());
        dto.setReviewRemarks(e.getReviewRemarks());
        dto.setDocumentUrl(e.getDocumentUrl());
        return dto;
    }
}
