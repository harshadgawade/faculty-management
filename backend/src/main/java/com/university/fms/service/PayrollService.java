package com.university.fms.service;

import com.university.fms.entity.*;
import com.university.fms.exception.BadRequestException;
import com.university.fms.exception.ResourceNotFoundException;
import com.university.fms.repository.FacultyRepository;
import com.university.fms.repository.PayrollRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PayrollService {

    private final PayrollRepository payrollRepository;
    private final FacultyRepository facultyRepository;

    /**
     * Auto-calculate and persist payroll for a faculty for a given month.
     * Uses the faculty's current payroll grade.
     */
    @Transactional
    public Payroll generatePayroll(Long facultyId, LocalDate month, int lopDays) {
        if (payrollRepository.findByFacultyIdAndPayrollMonth(facultyId, month).isPresent()) {
            throw new BadRequestException("Payroll already generated for " + month);
        }

        FacultyDetails faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty", facultyId));

        // Resolve grade from designation (simplified mapping)
        PayrollGrade grade = resolveGrade(faculty.getDesignation());

        BigDecimal basic = grade.getBasicSalary();
        BigDecimal hra   = basic.multiply(grade.getHraPercent())
                                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal da    = basic.multiply(grade.getDaPercent())
                                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal ta    = grade.getTaFixed();
        BigDecimal pf    = basic.multiply(grade.getPfPercent())
                                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        // LOP deduction: (basic / 30) * lopDays
        BigDecimal lopDed = lopDays > 0
                ? basic.divide(BigDecimal.valueOf(30), 2, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(lopDays))
                : BigDecimal.ZERO;

        Payroll payroll = Payroll.builder()
                .faculty(faculty)
                .grade(grade)
                .payrollMonth(month)
                .basicSalary(basic)
                .hra(hra)
                .da(da)
                .ta(ta)
                .pfDeduction(pf)
                .lopDeduction(lopDed)
                .researchStipend(BigDecimal.ZERO)
                .lectureAllowance(BigDecimal.ZERO)
                .tdsDeduction(BigDecimal.ZERO)
                .otherDeductions(BigDecimal.ZERO)
                .paymentStatus(Payroll.PaymentStatus.PENDING)
                .build();

        payroll.computeSalary();
        return payrollRepository.save(payroll);
    }

    @Transactional(readOnly = true)
    public List<Payroll> getMonthlyPayroll(LocalDate month) {
        return payrollRepository.findByPayrollMonth(month);
    }

    @Transactional(readOnly = true)
    public BigDecimal monthlyNetPayroll(LocalDate month) {
        BigDecimal total = payrollRepository.totalNetPayrollForMonth(month);
        return total != null ? total : BigDecimal.ZERO;
    }

    /** Simplified designation → grade mapping. Extend with DB lookup as needed. */
    private PayrollGrade resolveGrade(String designation) {
        if (designation == null) throw new BadRequestException("Faculty has no designation set.");
        return switch (designation.toUpperCase()) {
            case "PROFESSOR"             -> PayrollGrade.builder()
                    .id(1L).gradeCode("PG-PROF").basicSalary(BigDecimal.valueOf(120000))
                    .hraPercent(BigDecimal.valueOf(30)).daPercent(BigDecimal.valueOf(17))
                    .taFixed(BigDecimal.valueOf(3500)).pfPercent(BigDecimal.valueOf(12)).build();
            case "ASSOCIATE PROFESSOR"   -> PayrollGrade.builder()
                    .id(2L).gradeCode("PG-ASSOC").basicSalary(BigDecimal.valueOf(90000))
                    .hraPercent(BigDecimal.valueOf(27)).daPercent(BigDecimal.valueOf(17))
                    .taFixed(BigDecimal.valueOf(3000)).pfPercent(BigDecimal.valueOf(12)).build();
            case "ASSISTANT PROFESSOR"   -> PayrollGrade.builder()
                    .id(3L).gradeCode("PG-ASST").basicSalary(BigDecimal.valueOf(65000))
                    .hraPercent(BigDecimal.valueOf(24)).daPercent(BigDecimal.valueOf(17))
                    .taFixed(BigDecimal.valueOf(2500)).pfPercent(BigDecimal.valueOf(12)).build();
            default                      -> PayrollGrade.builder()
                    .id(4L).gradeCode("PG-GUEST").basicSalary(BigDecimal.valueOf(25000))
                    .hraPercent(BigDecimal.valueOf(10)).daPercent(BigDecimal.ZERO)
                    .taFixed(BigDecimal.ZERO).pfPercent(BigDecimal.ZERO).build();
        };
    }
}
