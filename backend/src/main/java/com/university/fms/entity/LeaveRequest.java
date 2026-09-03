package com.university.fms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "leave_requests")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LeaveRequest {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "faculty_id", nullable = false)
    private FacultyDetails faculty;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "leave_type_id", nullable = false)
    private LeaveType leaveType;

    @Column(name = "from_date", nullable = false)
    private LocalDate fromDate;

    @Column(name = "to_date", nullable = false)
    private LocalDate toDate;

    @Column(name = "reason", nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LeaveStatus status = LeaveStatus.PENDING;

    @Column(name = "applied_on", updatable = false)
    private LocalDateTime appliedOn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @Column(name = "reviewed_on")
    private LocalDateTime reviewedOn;

    @Column(name = "review_remarks", length = 500)
    private String reviewRemarks;

    @Column(name = "document_url", length = 500)
    private String documentUrl;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist  protected void onCreate() {
        createdAt = updatedAt = LocalDateTime.now();
        appliedOn = LocalDateTime.now();
    }
    @PreUpdate   protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    /** Total days computed at service layer (DB trigger handles it in SQL) */
    @Transient
    public long getTotalDays() {
        if (fromDate == null || toDate == null) return 0;
        return fromDate.datesUntil(toDate.plusDays(1)).count();
    }

    public enum LeaveStatus { PENDING, APPROVED, REJECTED, CANCELLED }
}
