package com.university.fms.repository;

import com.university.fms.entity.AcademicCalendar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface AcademicCalendarRepository extends JpaRepository<AcademicCalendar, Long> {

    @Query("""
            SELECT e FROM AcademicCalendar e
            WHERE (e.department IS NULL OR e.department.id = :deptId)
              AND e.startDatetime BETWEEN :from AND :to
            ORDER BY e.startDatetime ASC
            """)
    List<AcademicCalendar> findEventsInRange(@Param("deptId") Long deptId,
                                              @Param("from")   LocalDateTime from,
                                              @Param("to")     LocalDateTime to);
}
