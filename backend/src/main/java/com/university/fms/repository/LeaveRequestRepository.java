package com.university.fms.repository;

import com.university.fms.entity.LeaveRequest;
import com.university.fms.entity.LeaveRequest.LeaveStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    Page<LeaveRequest> findByFacultyId(Long facultyId, Pageable pageable);

    List<LeaveRequest> findByFacultyIdAndStatus(Long facultyId, LeaveStatus status);

    Page<LeaveRequest> findByStatus(LeaveStatus status, Pageable pageable);

    @Query("""
            SELECT COALESCE(SUM(DATEDIFF(l.toDate, l.fromDate) + 1), 0)
            FROM LeaveRequest l
            WHERE l.faculty.id       = :facultyId
              AND l.leaveType.id     = :typeId
              AND l.status           = 'APPROVED'
              AND YEAR(l.fromDate)   = :year
            """)
    int countApprovedDays(@Param("facultyId") Long facultyId,
                          @Param("typeId")    Long typeId,
                          @Param("year")      int year);

    /** Pending leaves for a department — HOD review queue */
    @Query("""
            SELECT l FROM LeaveRequest l
            JOIN l.faculty f
            WHERE f.department.id = :deptId
              AND l.status = 'PENDING'
            ORDER BY l.appliedOn ASC
            """)
    List<LeaveRequest> findPendingByDepartment(@Param("deptId") Long deptId);
}
