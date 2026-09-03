package com.university.fms.controller;

import com.university.fms.dto.LeaveRequestDto;
import com.university.fms.entity.User;
import com.university.fms.service.LeaveService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/leaves")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;

    /** POST /api/leaves — Faculty applies for leave */
    @PostMapping
    public ResponseEntity<LeaveRequestDto> apply(
            @Valid @RequestBody LeaveRequestDto dto) {
        return ResponseEntity.ok(leaveService.applyLeave(dto));
    }

    /** GET /api/leaves?facultyId=5 */
    @GetMapping
    public ResponseEntity<Page<LeaveRequestDto>> getByFaculty(
            @RequestParam Long facultyId,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(leaveService.getByFaculty(facultyId, pageable));
    }

    /** GET /api/leaves/pending — HOD / Dean review queue */
    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','DEAN','HOD')")
    public ResponseEntity<Page<LeaveRequestDto>> pending(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(leaveService.getPending(pageable));
    }

    /** POST /api/leaves/{id}/approve */
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','DEAN','HOD')")
    public ResponseEntity<LeaveRequestDto> approve(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal User reviewer) {

        String remarks = body != null ? body.get("remarks") : null;
        return ResponseEntity.ok(leaveService.reviewLeave(id, true, remarks, reviewer.getId()));
    }

    /** POST /api/leaves/{id}/reject */
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','DEAN','HOD')")
    public ResponseEntity<LeaveRequestDto> reject(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal User reviewer) {

        String remarks = body != null ? body.get("remarks") : null;
        return ResponseEntity.ok(leaveService.reviewLeave(id, false, remarks, reviewer.getId()));
    }
}
