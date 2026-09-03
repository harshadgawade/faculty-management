package com.university.fms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "payroll",
       uniqueConstraints = @UniqueConstraint(columnNames = {"faculty_id", "payroll_month"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Payroll {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "faculty_id", nullable = false)
    private FacultyDetails faculty;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "grade_id", nullable = false)
    private PayrollGrade grade;

    @Column(name = "payroll_month", nullable = false)
    private LocalDate payrollMonth;   // Always first day of month

    @Column(name = "basic_salary", nullable = false, precision = 12, scale = 2)
    private BigDecimal basicSalary;

    @Column(precision = 12, scale = 2)
    private BigDecimal hra = BigDecimal.ZERO;

    @Column(precision = 12, scale = 2)
    private BigDecimal da = BigDecimal.ZERO;

    @Column(precision = 12, scale = 2)
    private BigDecimal ta = BigDecimal.ZERO;

    @Column(name = "research_stipend", precision = 12, scale = 2)
    private BigDecimal researchStipend = BigDecimal.ZERO;

    @Column(name = "lecture_allowance", precision = 12, scale = 2)
    private BigDecimal lectureAllowance = BigDecimal.ZERO;

    @Column(name = "gross_salary", nullable = false, precision = 12, scale = 2)
    private BigDecimal grossSalary;

    @Column(name = "pf_deduction", precision = 12, scale = 2)
    private BigDecimal pfDeduction = BigDecimal.ZERO;

    @Column(name = "tds_deduction", precision = 12, scale = 2)
    private BigDecimal tdsDeduction = BigDecimal.ZERO;

    @Column(name = "lop_deduction", precision = 12, scale = 2)
    private BigDecimal lopDeduction = BigDecimal.ZERO;

    @Column(name = "other_deductions", precision = 12, scale = 2)
    private BigDecimal otherDeductions = BigDecimal.ZERO;

    @Column(name = "net_salary", nullable = false, precision = 12, scale = 2)
    private BigDecimal netSalary;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 20)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "payment_date")
    private LocalDate paymentDate;

    @Column(name = "payment_reference", length = 100)
    private String paymentReference;

    @Column(name = "slip_generated", nullable = false)
    private boolean slipGenerated = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist  protected void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate   protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    /** Compute gross and net before persist (mirrors DB trigger logic) */
    public void computeSalary() {
        grossSalary = basicSalary.add(hra).add(da).add(ta)
                                 .add(researchStipend).add(lectureAllowance);
        netSalary   = grossSalary.subtract(pfDeduction)
                                 .subtract(tdsDeduction)
                                 .subtract(lopDeduction)
                                 .subtract(otherDeductions);
    }

    public enum PaymentStatus { PENDING, PROCESSED, PAID, HELD }
}
