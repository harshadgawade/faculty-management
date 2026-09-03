package com.university.fms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "leave_types")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LeaveType {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "type_code", nullable = false, unique = true, length = 20)
    private String typeCode;

    @Column(name = "type_name", nullable = false, length = 80)
    private String typeName;

    @Column(name = "max_days_year", nullable = false)
    private int maxDaysYear = 12;

    @Column(name = "is_paid", nullable = false)
    private boolean isPaid = true;
}
