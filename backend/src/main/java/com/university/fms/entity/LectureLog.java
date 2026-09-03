package com.university.fms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "lecture_logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LectureLog {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "faculty_id", nullable = false)
    private FacultyDetails faculty;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(name = "lecture_date", nullable = false)
    private LocalDate lectureDate;

    @Column(name = "punch_in")
    private LocalDateTime punchIn;

    @Column(name = "punch_out")
    private LocalDateTime punchOut;

    @Column(name = "topic_covered", length = 500)
    private String topicCovered;

    @Column(name = "lectures_completed", nullable = false)
    private int lecturesCompleted = 1;

    @Column(name = "syllabus_percentage", precision = 5, scale = 2)
    private BigDecimal syllabusPercentage = BigDecimal.ZERO;

    @Column(length = 255)
    private String remarks;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist protected void onCreate() { createdAt = LocalDateTime.now(); }

    @Transient
    public Long getDurationMinutes() {
        if (punchIn == null || punchOut == null) return null;
        return java.time.Duration.between(punchIn, punchOut).toMinutes();
    }
}
