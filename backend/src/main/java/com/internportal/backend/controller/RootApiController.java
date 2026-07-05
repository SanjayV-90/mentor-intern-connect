package com.internportal.backend.controller;

import com.internportal.backend.domain.enums.AccountStatus;
import com.internportal.backend.domain.enums.RoleType;
import com.internportal.backend.dto.request.AssignmentCreateRequest;
import com.internportal.backend.dto.response.*;
import com.internportal.backend.security.CustomUserDetails;
import com.internportal.backend.service.AdminService;
import com.internportal.backend.service.AnalyticsService;
import com.internportal.backend.service.AssignmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Root API", description = "Endpoints verifying top-level assignments, mentor, and metrics routes")
public class RootApiController {

    private final AssignmentService assignmentService;
    private final AnalyticsService analyticsService;
    private final AdminService adminService;

    @GetMapping("/assignments")
    @Operation(summary = "Get all assignments or current user assignments")
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> getAssignments(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) UUID internId) {
        if (internId != null) {
            return ResponseEntity.ok(ApiResponse.success("Submissions fetched", assignmentService.getMyAssignments(internId)));
        }
        if (userDetails != null && userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_INTERN"))) {
            return ResponseEntity.ok(ApiResponse.success("Submissions fetched", assignmentService.getMyAssignments(userDetails.getId())));
        }
        return ResponseEntity.ok(ApiResponse.success("All submissions fetched", assignmentService.getAllAssignments()));
    }

    @PostMapping(value = "/assignments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Submit assignment")
    public ResponseEntity<ApiResponse<AssignmentResponse>> submitAssignment(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestPart("data") AssignmentCreateRequest request,
            @RequestPart(value = "screenshot", required = false) MultipartFile screenshot) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Assignment submitted successfully", assignmentService.submitAssignment(userDetails.getId(), request, screenshot)));
    }

    @PutMapping(value = {"/assignments", "/assignments/{id}"}, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Update assignment")
    public ResponseEntity<ApiResponse<AssignmentResponse>> updateAssignment(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable(required = false) UUID id,
            @Valid @RequestPart("data") AssignmentCreateRequest request,
            @RequestPart(value = "screenshot", required = false) MultipartFile screenshot) {
        if (id != null) request.setId(id);
        return ResponseEntity.ok(ApiResponse.success("Assignment updated successfully", assignmentService.submitAssignment(userDetails.getId(), request, screenshot)));
    }

    @GetMapping("/intern/{id}/assignments")
    @Operation(summary = "Get specific intern assignments")
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> getSpecificInternAssignments(
            @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Submissions fetched", assignmentService.getInternAssignmentsForManagerOrMentor(id)));
    }

    @GetMapping("/mentor/{id}/interns")
    @Operation(summary = "Get mentor's interns")
    public ResponseEntity<ApiResponse<Page<InternProfileResponse>>> getMentorInterns(
            @PathVariable UUID id,
            @RequestParam(required = false) AccountStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        Page<InternProfileResponse> interns = adminService.getAllInterns(status, search, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return ResponseEntity.ok(ApiResponse.success("Interns fetched successfully", interns));
    }

    @GetMapping("/dashboard/metrics")
    @Operation(summary = "Get dashboard metrics")
    public ResponseEntity<ApiResponse<AdminDashboardAnalyticsResponse>> getDashboardMetrics() {
        return ResponseEntity.ok(ApiResponse.success("Dashboard metrics fetched", analyticsService.getDashboardAnalytics()));
    }
}
