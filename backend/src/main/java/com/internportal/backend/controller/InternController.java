package com.internportal.backend.controller;

import com.internportal.backend.dto.request.*;
import com.internportal.backend.dto.response.*;
import com.internportal.backend.security.CustomUserDetails;
import com.internportal.backend.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/intern")
@RequiredArgsConstructor
@Tag(name = "Intern API", description = "Endpoints for Intern daily actions (Attendance, Coding problems, Duolingo, Tasks)")
public class InternController {

    private final InternService internService;
    private final AttendanceService attendanceService;
    private final AssignmentService assignmentService;
    private final DuolingoService duolingoService;
    private final TaskService taskService;

    @GetMapping("/profile/me")
    @Operation(summary = "Get current logged-in intern profile")
    public ResponseEntity<ApiResponse<InternProfileResponse>> getMyProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Profile fetched", internService.getMyProfile(userDetails.getId())));
    }

    @PutMapping("/profile/me")
    @Operation(summary = "Update my skills, github, linkedin, address")
    public ResponseEntity<ApiResponse<InternProfileResponse>> updateMyProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody InternProfileUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", internService.updateMyProfile(userDetails.getId(), request)));
    }

    @PostMapping("/attendance/check-in")
    @Operation(summary = "Mark daily attendance check-in")
    public ResponseEntity<ApiResponse<AttendanceResponse>> checkIn(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody(required = false) AttendanceCheckInRequest request) {
        if (request == null) request = new AttendanceCheckInRequest();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Checked in successfully", attendanceService.checkIn(userDetails.getId(), request)));
    }

    @PostMapping("/attendance/check-out")
    @Operation(summary = "Mark daily attendance check-out")
    public ResponseEntity<ApiResponse<AttendanceResponse>> checkOut(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Checked out successfully", attendanceService.checkOut(userDetails.getId())));
    }

    @GetMapping("/attendance")
    @Operation(summary = "Get my attendance history")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getMyAttendance(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Attendance fetched", attendanceService.getInternAttendanceHistory(userDetails.getId())));
    }

    @GetMapping("/attendance/summary")
    @Operation(summary = "Get my attendance summary statistics")
    public ResponseEntity<ApiResponse<AttendanceSummaryResponse>> getMyAttendanceSummary(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Attendance summary fetched", attendanceService.getAttendanceSummary(userDetails.getId())));
    }

    @PostMapping(value = "/assignments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Submit completed problem with URL and screenshot")
    public ResponseEntity<ApiResponse<AssignmentResponse>> submitAssignment(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestPart("data") AssignmentCreateRequest request,
            @RequestPart(value = "screenshot", required = false) MultipartFile screenshot) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Assignment submitted successfully", assignmentService.submitAssignment(userDetails.getId(), request, screenshot)));
    }

    @GetMapping("/assignments")
    @Operation(summary = "Get my problem solving submissions")
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> getMyAssignments(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Submissions fetched", assignmentService.getMyAssignments(userDetails.getId())));
    }

    @PutMapping(value = {"/assignments", "/assignments/{id}"}, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Update submitted assignment")
    public ResponseEntity<ApiResponse<AssignmentResponse>> updateAssignment(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable(required = false) UUID id,
            @Valid @RequestPart("data") AssignmentCreateRequest request,
            @RequestPart(value = "screenshot", required = false) MultipartFile screenshot) {
        if (id != null) request.setId(id);
        return ResponseEntity.ok(ApiResponse.success("Assignment updated successfully", assignmentService.submitAssignment(userDetails.getId(), request, screenshot)));
    }

    @DeleteMapping("/assignments/{id}")
    @Operation(summary = "Delete submitted assignment")
    public ResponseEntity<ApiResponse<Void>> deleteAssignment(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID id) {
        assignmentService.deleteAssignment(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Assignment deleted successfully", null));
    }

    @PostMapping(value = "/duolingo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Log daily Duolingo streak & screenshot")
    public ResponseEntity<ApiResponse<DuolingoResponse>> updateDuolingo(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestPart("data") DuolingoUpdateRequest request,
            @RequestPart(value = "screenshot", required = false) MultipartFile screenshot) {
        return ResponseEntity.ok(ApiResponse.success("Duolingo streak updated", duolingoService.updateDuolingoStreak(userDetails.getId(), request, screenshot)));
    }

    @GetMapping("/duolingo")
    @Operation(summary = "Get my Duolingo streak history")
    public ResponseEntity<ApiResponse<List<DuolingoResponse>>> getMyDuolingo(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Duolingo logs fetched", duolingoService.getMyDuolingoHistory(userDetails.getId())));
    }

    @PostMapping("/tasks")
    @Operation(summary = "Create a daily task")
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody TaskCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Task created successfully", taskService.createTask(userDetails.getId(), request)));
    }

    @PatchMapping("/tasks/{taskId}/progress")
    @Operation(summary = "Update task progress percentage (0-100%) and status")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTaskProgress(
            @PathVariable UUID taskId,
            @Valid @RequestBody TaskProgressUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Task progress updated", taskService.updateProgress(taskId, request)));
    }

    @GetMapping("/tasks")
    @Operation(summary = "Get my daily tasks")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getMyTasks(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Tasks fetched", taskService.getMyTasks(userDetails.getId())));
    }

    @PostMapping(value = "/profile/resume", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload resume (PDF only, max 5MB)")
    public ResponseEntity<ApiResponse<InternProfileResponse>> uploadResume(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestPart("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success("Resume uploaded successfully", internService.uploadResume(userDetails.getId(), file)));
    }

    @DeleteMapping("/profile/resume")
    @Operation(summary = "Delete uploaded resume")
    public ResponseEntity<ApiResponse<InternProfileResponse>> deleteResume(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Resume deleted successfully", internService.deleteResume(userDetails.getId())));
    }

    @PostMapping(value = "/profile/picture", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload profile picture (JPG/PNG)")
    public ResponseEntity<ApiResponse<InternProfileResponse>> uploadProfilePicture(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestPart("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success("Profile picture updated successfully", internService.uploadProfilePicture(userDetails.getId(), file)));
    }

    @DeleteMapping("/profile/picture")
    @Operation(summary = "Remove profile picture")
    public ResponseEntity<ApiResponse<InternProfileResponse>> deleteProfilePicture(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Profile picture removed", internService.deleteProfilePicture(userDetails.getId())));
    }
}
