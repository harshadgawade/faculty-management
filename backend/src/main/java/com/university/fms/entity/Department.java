package com.university.fms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "departments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Department {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "dept_code", nullable = false, unique = true, length = 10)
    private String deptCode;

    @Column(name = "dept_name", nullable = false, length = 120)
    private String deptName;

    /** Lazy reference to avoid circular loading; set after faculty insert. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hod_faculty_id")
    private FacultyDetails hodFaculty;

    @Column(name = "established_on")
    private LocalDate establishedOn;

    @Column(name = "budget_allocated", precision = 15, scale = 2)
    private BigDecimal budgetAllocated = BigDecimal.ZERO;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist  protected void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate   protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
