package com.university.fms.service;

import com.university.fms.dto.AttendanceDto;
import com.university.fms.entity.Attendance;
import com.university.fms.entity.FacultyDetails;
import com.university.fms.entity.Subject;
import com.university.fms.exception.BadRequestException;
import com.university.fms.exception.ResourceNotFoundException;
import com.university.fms.repository.AttendanceRepository;
import com.university.fms.repository.FacultyRepository;
import com.university.fms.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final FacultyRepository facultyRepository;
    private final SubjectRepository subjectRepository;

    @Transactional
    public AttendanceDto markAttendance(AttendanceDto dto) {
        FacultyDetails faculty = facultyRepository.findById(dto.getFacultyId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty", dto.getFacultyId()));
        Subject subject = subjectRepository.findById(dto.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject", dto.getSubjectId()));

        if (attendanceRepository.findByFacultyIdAndSubjectIdAndAttendanceDate(
                dto.getFacultyId(), dto.getSubjectId(), dto.getAttendanceDate()).isPresent()) {
            throw new BadRequestException("Attendance already marked for this faculty, subject and date");
        }

        Attendance entity = Attendance.builder()
                .faculty(faculty)
                .subject(subject)
                .attendanceDate(dto.getAttendanceDate())
                .status(dto.getStatus())
                .checkIn(dto.getCheckIn())
                .checkOut(dto.getCheckOut())
                .remarks(dto.getRemarks())
                .build();

        return toDto(attendanceRepository.save(entity));
    }

    @Transactional
    public AttendanceDto updateAttendance(Long id, AttendanceDto dto) {
        Attendance entity = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance", id));

        entity.setStatus(dto.getStatus());
        entity.setCheckIn(dto.getCheckIn());
        entity.setCheckOut(dto.getCheckOut());
        entity.setRemarks(dto.getRemarks());

        if (dto.getSubjectId() != null && !dto.getSubjectId().equals(entity.getSubject().getId())) {
            Subject subject = subjectRepository.findById(dto.getSubjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subject", dto.getSubjectId()));
            entity.setSubject(subject);
        }
        return toDto(attendanceRepository.save(entity));
    }

    @Transactional(readOnly = true)
    public List<AttendanceDto> getMonthlyAttendance(Long facultyId, int year, int month) {
        LocalDate from = LocalDate.of(year, month, 1);
        LocalDate to = from.withDayOfMonth(from.lengthOfMonth());
        return attendanceRepository.findByFacultyIdAndAttendanceDateBetween(facultyId, from, to)
                .stream().map(this::toDto).toList();
    }

    private AttendanceDto toDto(Attendance a) {
        AttendanceDto dto = new AttendanceDto();
        dto.setId(a.getId());
        dto.setFacultyId(a.getFaculty().getId());
        dto.setSubjectId(a.getSubject().getId());
        dto.setAttendanceDate(a.getAttendanceDate());
        dto.setStatus(a.getStatus());
        dto.setCheckIn(a.getCheckIn());
        dto.setCheckOut(a.getCheckOut());
        dto.setRemarks(a.getRemarks());
        return dto;
    }
}
