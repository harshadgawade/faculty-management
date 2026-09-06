package com.university.fms.repository;

import com.university.fms.entity.Attendance;
import com.university.fms.entity.Attendance.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    Optional<Attendance> findByFacultyIdAndSubjectIdAndAttendanceDate(Long facultyId, Long subjectId, LocalDate date);

    List<Attendance> findByFacultyIdAndAttendanceDateBetween(Long facultyId, LocalDate from, LocalDate to);

    List<Attendance> findByFacultyIdAndSubjectIdAndAttendanceDateBetween(Long facultyId, Long subjectId, LocalDate from, LocalDate to);

    @Query("""
            SELECT a.status AS status, COUNT(a) AS cnt
            FROM Attendance a
            WHERE a.faculty.id = :facultyId
              AND a.attendanceDate BETWEEN :from AND :to
            GROUP BY a.status
            """)
    List<Map<String, Object>> getSummary(@Param("facultyId") Long facultyId,
                                         @Param("from") LocalDate from,
                                         @Param("to") LocalDate to);

    @Query("""
            SELECT COUNT(a) FROM Attendance a
            WHERE a.faculty.id = :facultyId
              AND a.status = :status
              AND a.attendanceDate BETWEEN :from AND :to
            """)
    long countByStatus(@Param("facultyId") Long facultyId,
                       @Param("status") AttendanceStatus status,
                       @Param("from") LocalDate from,
                       @Param("to") LocalDate to);
}
