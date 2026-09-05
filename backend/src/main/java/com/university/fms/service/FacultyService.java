package com.university.fms.service;

import com.university.fms.dto.FacultyDto;
import com.university.fms.entity.Department;
import com.university.fms.entity.FacultyDetails;
import com.university.fms.entity.Role;
import com.university.fms.entity.User;
import com.university.fms.exception.BadRequestException;
import com.university.fms.exception.ResourceNotFoundException;
import com.university.fms.repository.DepartmentRepository;
import com.university.fms.repository.FacultyRepository;
import com.university.fms.repository.RoleRepository;
import com.university.fms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FacultyService {
    private final FacultyRepository facultyRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Page<FacultyDto> search(Long deptId,String name,Pageable pageable){return facultyRepository.search(deptId,name,pageable).map(this::toDto);}
    @Transactional(readOnly = true)
    public FacultyDto getById(Long id){return toDto(findOrThrow(id));}

    @Transactional
    public FacultyDto create(FacultyDto dto){
        if(userRepository.existsByEmail(dto.getEmail())) throw new BadRequestException("Email already registered: "+dto.getEmail());
        Department dept=departmentRepository.findById(dto.getDepartmentId()).orElseThrow(()->new ResourceNotFoundException("Department",dto.getDepartmentId()));
        if(dto.getRoleId()==null||dto.getRoleId().isBlank()) throw new BadRequestException("Role is required");
        Role role=roleRepository.findById(Long.parseLong(dto.getRoleId())).orElseThrow(()->new ResourceNotFoundException("Role",Long.parseLong(dto.getRoleId())));
        User user=User.builder().email(dto.getEmail()).passwordHash(passwordEncoder.encode(UUID.randomUUID().toString())).role(role).isActive(true).build();
        user=userRepository.save(user);
        FacultyDetails faculty=FacultyDetails.builder().user(user).department(dept).employeeCode(dto.getEmployeeCode()).firstName(dto.getFirstName()).lastName(dto.getLastName()).designation(dto.getDesignation()).qualification(dto.getQualification()).specialisation(dto.getSpecialisation()).dateOfJoining(dto.getDateOfJoining()).dateOfBirth(dto.getDateOfBirth()).gender(dto.getGender()).contactNumber(dto.getContactNumber()).alternateEmail(dto.getAlternateEmail()).address(dto.getAddress()).experienceYears(dto.getExperienceYears()).publicationsCount(dto.getPublicationsCount()).patentsCount(dto.getPatentsCount()).isPhdGuide(dto.isPhdGuide()).build();
        return toDto(facultyRepository.save(faculty));
    }

    @Transactional
    public FacultyDto update(Long id,FacultyDto dto){
        FacultyDetails faculty=findOrThrow(id);
        if(dto.getDepartmentId()!=null&&!dto.getDepartmentId().equals(faculty.getDepartment().getId())) faculty.setDepartment(departmentRepository.findById(dto.getDepartmentId()).orElseThrow(()->new ResourceNotFoundException("Department",dto.getDepartmentId())));
        if(dto.getFirstName()!=null)faculty.setFirstName(dto.getFirstName()); if(dto.getLastName()!=null)faculty.setLastName(dto.getLastName()); if(dto.getDesignation()!=null)faculty.setDesignation(dto.getDesignation()); if(dto.getQualification()!=null)faculty.setQualification(dto.getQualification()); if(dto.getSpecialisation()!=null)faculty.setSpecialisation(dto.getSpecialisation()); if(dto.getContactNumber()!=null)faculty.setContactNumber(dto.getContactNumber()); if(dto.getAddress()!=null)faculty.setAddress(dto.getAddress()); if(dto.getExperienceYears()!=null)faculty.setExperienceYears(dto.getExperienceYears()); faculty.setPublicationsCount(dto.getPublicationsCount()); faculty.setPatentsCount(dto.getPatentsCount()); faculty.setPhdGuide(dto.isPhdGuide());
        return toDto(facultyRepository.save(faculty));
    }

    @Transactional
    public void delete(Long id){FacultyDetails faculty=findOrThrow(id);faculty.getUser().setActive(false);facultyRepository.save(faculty);}
    private FacultyDetails findOrThrow(Long id){return facultyRepository.findById(id).orElseThrow(()->new ResourceNotFoundException("Faculty",id));}
    FacultyDto toDto(FacultyDetails f){FacultyDto d=new FacultyDto();d.setId(f.getId());d.setEmployeeCode(f.getEmployeeCode());d.setFirstName(f.getFirstName());d.setLastName(f.getLastName());d.setDepartmentId(f.getDepartment().getId());d.setDepartmentName(f.getDepartment().getDeptName());d.setDesignation(f.getDesignation());d.setQualification(f.getQualification());d.setSpecialisation(f.getSpecialisation());d.setDateOfJoining(f.getDateOfJoining());d.setDateOfBirth(f.getDateOfBirth());d.setGender(f.getGender());d.setContactNumber(f.getContactNumber());d.setAlternateEmail(f.getAlternateEmail());d.setAddress(f.getAddress());d.setPhotoUrl(f.getPhotoUrl());d.setExperienceYears(f.getExperienceYears());d.setPublicationsCount(f.getPublicationsCount());d.setPatentsCount(f.getPatentsCount());d.setPhdGuide(f.isPhdGuide());d.setEmail(f.getUser().getEmail());d.setRoleId(String.valueOf(f.getUser().getRole().getId()));return d;}
}
