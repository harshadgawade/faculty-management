package com.university.fms.controller;

import com.university.fms.dto.FacultyDto;
import com.university.fms.service.FacultyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/faculty")
@RequiredArgsConstructor
public class FacultyController {

    private final FacultyService facultyService;

    /** GET /api/faculty?deptId=1&name=sharma&page=0&size=20 */
    @GetMapping
    public ResponseEntity<Page<FacultyDto>> search(
            @RequestParam(required = false) Long deptId,
            @RequestParam(required = false) String name,
            @PageableDefault(size = 20, sort = "lastName") Pageable pageable) {

        return ResponseEntity.ok(facultyService.search(deptId, name, pageable));
    }

    /** GET /api/faculty/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<FacultyDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(facultyService.getById(id));
    }

    /** POST /api/faculty  — Dean/Super Admin only */
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','DEAN')")
    public ResponseEntity<FacultyDto> create(@Valid @RequestBody FacultyDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                             .body(facultyService.create(dto));
    }

    /** PUT /api/faculty/{id} */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','DEAN','HOD')")
    public ResponseEntity<FacultyDto> update(@PathVariable Long id,
                                              @Valid @RequestBody FacultyDto dto) {
        return ResponseEntity.ok(facultyService.update(id, dto));
    }

    /** DELETE /api/faculty/{id}  — Dean/Super Admin only (soft delete) */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','DEAN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        facultyService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
