package com.university.fms.repository;

import com.university.fms.entity.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PayrollRepository extends JpaRepository<Payroll, Long> {

    Optional<Payroll> findByFacultyIdAndPayrollMonth(Long facultyId, LocalDate month);

    List<Payroll> findByPayrollMonth(LocalDate month);

    @Query("""
            SELECT SUM(p.netSalary) FROM Payroll p
            WHERE p.payrollMonth = :month
              AND p.paymentStatus <> 'HELD'
            """)
    BigDecimal totalNetPayrollForMonth(@Param("month") LocalDate month);

    @Query("""
            SELECT p FROM Payroll p
            WHERE p.faculty.department.id = :deptId
              AND p.payrollMonth = :month
            """)
    List<Payroll> findByDepartmentAndMonth(@Param("deptId") Long deptId,
                                           @Param("month")  LocalDate month);
}
