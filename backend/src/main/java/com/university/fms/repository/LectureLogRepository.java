package com.university.fms.repository;

import com.university.fms.entity.LectureLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface LectureLogRepository extends JpaRepository<LectureLog, Long> {

    List<LectureLog> findByFacultyIdAndLectureDateBetween(
            Long facultyId, LocalDate from, LocalDate to);

    List<LectureLog> findByFacultyIdAndSubjectId(Long facultyId, Long subjectId);

    /** Latest log entry where punch_out is null = faculty is currently in class */
    @Query("""
            SELECT l FROM LectureLog l
            WHERE l.faculty.id = :fId
              AND l.punchOut IS NULL
            ORDER BY l.punchIn DESC
            """)
    Optional<LectureLog> findActiveSession(@Param("fId") Long facultyId);

    @Query("""
            SELECT SUM(l.lecturesCompleted) FROM LectureLog l
            WHERE l.faculty.id = :fId AND l.subject.id = :sId
            """)
    Integer totalLecturesDone(@Param("fId") Long facultyId, @Param("sId") Long subjectId);
}
