package com.university.fms.dto;

import com.university.fms.entity.FacultyDetails.Gender;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class FacultyDto {

    private Long   id;

    @NotBlank
    private String employeeCode;

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @NotNull
    private Long departmentId;
    private String departmentName;

    private String designation;
    private String qualification;
    private String specialisation;

    @NotNull
    private LocalDate dateOfJoining;
    private LocalDate dateOfBirth;

    private Gender gender;

    private String contactNumber;

    @Email
    private String alternateEmail;

    private String address;
    private String photoUrl;
    private BigDecimal experienceYears;
    private int    publicationsCount;
    private int    patentsCount;
    private boolean phdGuide;

    // Auth fields (write-only on create)
    private String email;
    private String roleId;
}
