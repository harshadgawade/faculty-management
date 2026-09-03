package com.university.fms.repository;

import com.university.fms.entity.FacultyDetails;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FacultyRepository extends JpaRepository<FacultyDetails, Long> {

    Optional<FacultyDetails> findByUserId(Long userId);

    Optional<FacultyDetails> findByEmployeeCode(String employeeCode);

    List<FacultyDetails> findByDepartmentId(Long departmentId);

    Page<FacultyDetails> findByDepartmentId(Long departmentId, Pageable pageable);

    @Query("""
            SELECT f FROM FacultyDetails f
            WHERE (:dept IS NULL OR f.department.id = :dept)
              AND (:name IS NULL
                   OR LOWER(f.firstName) LIKE LOWER(CONCAT('%', :name, '%'))
                   OR LOWER(f.lastName)  LIKE LOWER(CONCAT('%', :name, '%')))
            """)
    Page<FacultyDetails> search(@Param("dept") Long departmentId,
                                @Param("name") String name,
                                Pageable pageable);

    @Query("SELECT COUNT(f) FROM FacultyDetails f WHERE f.department.id = :deptId")
    long countByDepartment(@Param("deptId") Long deptId);
}
