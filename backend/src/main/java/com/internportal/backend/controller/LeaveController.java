package com.internportal.backend.controller;

import com.internportal.backend.domain.enums.LeaveStatus;
import com.internportal.backend.dto.request.LeaveRequestCreateDto;
import com.internportal.backend.dto.request.LeaveReviewDto;
import com.internportal.backend.dto.response.ApiResponse;
import com.internportal.backend.dto.response.LeaveRequestResponse;
import com.internportal.backend.security.CustomUserDetails;
import com.internportal.backend.service.LeaveService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Leave API", description = "Endpoints for Intern Leave Requests and Admin Approvals")
public class LeaveController {

    private final LeaveService leaveService;

    @PostMapping("/intern/leaves")
    @Operation(summary = "Submit a new leave request (Intern)")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> submitLeaveRequest(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody LeaveRequestCreateDto dto) {
        LeaveRequestResponse response = leaveService.submitLeaveRequest(principal.getId(), dto);
        return ResponseEntity.ok(ApiResponse.success("Leave request submitted successfully", response));
    }

    @GetMapping("/intern/leaves")
    @Operation(summary = "Get my leave requests (Intern)")
    public ResponseEntity<ApiResponse<List<LeaveRequestResponse>>> getMyLeaves(
            @AuthenticationPrincipal CustomUserDetails principal) {
        List<LeaveRequestResponse> leaves = leaveService.getInternLeaveRequests(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Leave requests fetched successfully", leaves));
    }

    @DeleteMapping("/intern/leaves/{id}")
    @Operation(summary = "Cancel a pending leave request (Intern)")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> cancelLeave(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable UUID id) {
        LeaveRequestResponse response = leaveService.cancelLeaveRequest(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Leave request cancelled successfully", response));
    }

    @GetMapping("/admin/leaves")
    @Operation(summary = "Get all leave requests across batch (Admin)")
    public ResponseEntity<ApiResponse<List<LeaveRequestResponse>>> getAllLeaves(
            @RequestParam(required = false) UUID internId,
            @RequestParam(required = false) LeaveStatus status) {
        List<LeaveRequestResponse> leaves = leaveService.getAllLeaveRequests(internId, status);
        return ResponseEntity.ok(ApiResponse.success("All leave requests fetched successfully", leaves));
    }

    @PutMapping("/admin/leaves/{id}/review")
    @Operation(summary = "Review (approve/reject) a leave request (Admin)")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> reviewLeave(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable UUID id,
            @Valid @RequestBody LeaveReviewDto dto) {
        LeaveRequestResponse response = leaveService.reviewLeaveRequest(principal.getId(), id, dto);
        return ResponseEntity.ok(ApiResponse.success("Leave request reviewed successfully", response));
    }
}
