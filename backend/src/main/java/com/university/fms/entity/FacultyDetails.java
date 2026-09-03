package com.university.fms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "faculty_details")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FacultyDetails {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(name = "employee_code", nullable = false, unique = true, length = 20)
    private String employeeCode;

    @Column(name = "first_name", nullable = false, length = 80)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 80)
    private String lastName;

    @Column(length = 100)
    private String designation;

    @Column(length = 200)
    private String qualification;

    @Column(length = 200)
    private String specialisation;

    @Column(name = "date_of_joining", nullable = false)
    private LocalDate dateOfJoining;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Column(name = "contact_number", length = 15)
    private String contactNumber;

    @Column(name = "alternate_email", length = 150)
    private String alternateEmail;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "photo_url", length = 500)
    private String photoUrl;

    @Column(name = "experience_years", precision = 4, scale = 1)
    private BigDecimal experienceYears = BigDecimal.ZERO;

    @Column(name = "publications_count")
    private int publicationsCount = 0;

    @Column(name = "patents_count")
    private int patentsCount = 0;

    @Column(name = "is_phd_guide")
    private boolean isPhdGuide = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist  protected void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate   protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    /** Convenience: full display name */
    @Transient
    public String getFullName() { return firstName + " " + lastName; }

    public enum Gender { MALE, FEMALE, OTHER }
}
