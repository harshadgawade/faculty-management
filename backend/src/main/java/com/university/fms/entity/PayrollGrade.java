package com.university.fms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payroll_grades")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PayrollGrade {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "grade_code", nullable = false, unique = true, length = 20)
    private String gradeCode;

    @Column(nullable = false, length = 100)
    private String designation;

    @Column(name = "basic_salary", nullable = false, precision = 12, scale = 2)
    private BigDecimal basicSalary;

    @Column(name = "hra_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal hraPercent;

    @Column(name = "da_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal daPercent;

    @Column(name = "ta_fixed", nullable = false, precision = 10, scale = 2)
    private BigDecimal taFixed;

    @Column(name = "pf_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal pfPercent;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist protected void onCreate() { createdAt = LocalDateTime.now(); }
}
