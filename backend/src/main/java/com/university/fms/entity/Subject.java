package com.university.fms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "subjects")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Subject {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "subject_code", nullable = false, unique = true, length = 20)
    private String subjectCode;

    @Column(name = "subject_name", nullable = false, length = 150)
    private String subjectName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(nullable = false)
    private int semester;

    @Column(nullable = false)
    private int credits = 3;

    @Enumerated(EnumType.STRING)
    @Column(name = "subject_type", length = 20)
    private SubjectType subjectType = SubjectType.THEORY;

    @Column(name = "total_lectures_planned", nullable = false)
    private int totalLecturesPlanned = 0;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist protected void onCreate() { createdAt = LocalDateTime.now(); }

    public enum SubjectType { THEORY, PRACTICAL, PROJECT, ELECTIVE }
}
