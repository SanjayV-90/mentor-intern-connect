package com.internportal.backend.service;

import com.internportal.backend.domain.entity.Assignment;
import com.internportal.backend.domain.entity.AssignmentScreenshot;
import com.internportal.backend.domain.entity.User;
import com.internportal.backend.domain.enums.AssignmentStatus;
import com.internportal.backend.dto.request.AssignmentCreateRequest;
import com.internportal.backend.dto.response.AssignmentResponse;
import com.internportal.backend.exception.CustomException;
import com.internportal.backend.mapper.EntityMapper;
import com.internportal.backend.repository.AssignmentRepository;
import com.internportal.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;
    private final EntityMapper entityMapper;
    private final NotificationService notificationService;

    @Transactional
    public AssignmentResponse submitAssignment(UUID internId, AssignmentCreateRequest request, MultipartFile screenshot) {
        User intern = userRepository.findById(internId)
                .orElseThrow(() -> new CustomException("Intern not found", HttpStatus.NOT_FOUND));

        Assignment assignment = null;
        if (request.getId() != null) {
            assignment = assignmentRepository.findById(request.getId()).orElse(null);
            if (assignment != null && !assignment.getIntern().getId().equals(internId)) {
                throw new CustomException("You do not own this assignment", HttpStatus.FORBIDDEN);
            }
        }

        boolean isUpdate = (assignment != null);
        if (assignment == null) {
            assignment = Assignment.builder()
                    .intern(intern)
                    .screenshots(new java.util.ArrayList<>())
                    .build();
        }

        assignment.setTitle(request.getTitle());
        assignment.setPlatform(request.getPlatform());
        assignment.setProblemUrl(request.getProblemUrl());
        assignment.setTechStack(request.getTechStack());
        assignment.setDifficulty(request.getDifficulty());
        assignment.setTimeTakenMinutes(request.getTimeTakenMinutes());
        assignment.setStatus(request.getStatus() != null ? request.getStatus() : (assignment.getStatus() != null ? assignment.getStatus() : AssignmentStatus.SOLVED));
        assignment.setNotes(request.getNotes());
        assignment.setSubmissionDate(LocalDate.now());
        assignment.setDeleted(false);

        if (screenshot != null && !screenshot.isEmpty()) {
            String contentType = screenshot.getContentType();
            String filename = screenshot.getOriginalFilename();
            boolean validExt = filename != null && (filename.toLowerCase().endsWith(".png") || filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg") || filename.toLowerCase().endsWith(".gif") || filename.toLowerCase().endsWith(".webp"));
            boolean validMime = contentType != null && contentType.startsWith("image/");
            if (!validExt && !validMime) {
                throw new CustomException("Invalid screenshot format. Only image files (PNG, JPG, JPEG) are supported.", HttpStatus.BAD_REQUEST);
            }
            String storedPath = storageService.storeFile(screenshot, "assignments");
            AssignmentScreenshot photo = AssignmentScreenshot.builder()
                    .assignment(assignment)
                    .filePath(storedPath)
                    .fileName(screenshot.getOriginalFilename())
                    .fileSizeBytes(screenshot.getSize())
                    .uploadedAt(LocalDateTime.now())
                    .build();
            if (assignment.getScreenshots() == null) {
                assignment.setScreenshots(new java.util.ArrayList<>());
            }
            assignment.getScreenshots().add(photo);
        }

        Assignment saved = assignmentRepository.save(assignment);
        String internName = intern.getInternProfile() != null ? intern.getInternProfile().getFullName() : intern.getEmail();
        String techName = request.getTechStack() != null ? formatTechName(request.getTechStack().name()) : "Coding";
        String notifTitle = String.format("%s submitted a new %s assignment.", internName, techName);
        String notifMsg = String.format("Intern Name: %s\nTechnology: %s\nAssignment Name: %s\nSubmission Time: %s\nStatus: %s",
                internName, techName, request.getTitle(), LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")), saved.getStatus());
        notificationService.createNotificationForAdmins(notifTitle, notifMsg, "ASSIGNMENT");
        return entityMapper.toAssignmentResponse(saved);
    }

    private String formatTechName(String raw) {
        if (raw == null) return "Coding";
        String s = raw.replace("_", " ");
        if (s.equalsIgnoreCase("JAVA")) return "Java";
        if (s.equalsIgnoreCase("PYTHON")) return "Python";
        if (s.equalsIgnoreCase("JAVASCRIPT")) return "JavaScript";
        if (s.equalsIgnoreCase("TYPESCRIPT")) return "TypeScript";
        if (s.equalsIgnoreCase("SPRING BOOT")) return "Spring Boot";
        if (s.equalsIgnoreCase("REACT")) return "React";
        return s.substring(0, 1).toUpperCase() + s.substring(1).toLowerCase();
    }

    @Transactional
    public AssignmentResponse updateAssignment(UUID internId, UUID assignmentId, AssignmentCreateRequest request, MultipartFile screenshot) {
        request.setId(assignmentId);
        return submitAssignment(internId, request, screenshot);
    }

    @Transactional
    public void deleteAssignment(UUID internId, UUID assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new CustomException("Assignment not found", HttpStatus.NOT_FOUND));
        if (!assignment.getIntern().getId().equals(internId)) {
            throw new CustomException("You do not own this assignment", HttpStatus.FORBIDDEN);
        }
        assignment.setDeleted(true);
        assignmentRepository.save(assignment);
    }

    @Transactional(readOnly = true)
    public List<AssignmentResponse> getMyAssignments(UUID internId) {
        return assignmentRepository.findByInternIdOrderBySubmissionDateDesc(internId).stream()
                .filter(a -> !a.isDeleted())
                .map(entityMapper::toAssignmentResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AssignmentResponse> getAllAssignments() {
        return assignmentRepository.findAll().stream()
                .filter(a -> !a.isDeleted())
                .sorted((a1, a2) -> {
                    if (a1.getSubmissionDate() != null && a2.getSubmissionDate() != null) {
                        int cmp = a2.getSubmissionDate().compareTo(a1.getSubmissionDate());
                        if (cmp != 0) return cmp;
                    }
                    return a2.getId().compareTo(a1.getId());
                })
                .map(entityMapper::toAssignmentResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AssignmentResponse approveAssignment(UUID assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new CustomException("Assignment not found", HttpStatus.NOT_FOUND));
        assignment.setStatus(AssignmentStatus.APPROVED);
        Assignment saved = assignmentRepository.save(assignment);
        String internName = assignment.getIntern().getInternProfile() != null ? assignment.getIntern().getInternProfile().getFullName() : assignment.getIntern().getEmail();
        notificationService.createNotificationForAdmins("Assignment Approved", "Manager approved assignment: " + assignment.getTitle() + " (" + internName + ")", "ASSIGNMENT");
        return entityMapper.toAssignmentResponse(saved);
    }

    @Transactional
    public AssignmentResponse rejectAssignment(UUID assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new CustomException("Assignment not found", HttpStatus.NOT_FOUND));
        assignment.setStatus(AssignmentStatus.REJECTED);
        Assignment saved = assignmentRepository.save(assignment);
        String internName = assignment.getIntern().getInternProfile() != null ? assignment.getIntern().getInternProfile().getFullName() : assignment.getIntern().getEmail();
        notificationService.createNotificationForAdmins("Assignment Rejected", "Manager rejected assignment: " + assignment.getTitle() + " (" + internName + ")", "ASSIGNMENT");
        return entityMapper.toAssignmentResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<AssignmentResponse> getInternAssignmentsForManagerOrMentor(UUID internId) {
        return getMyAssignments(internId);
    }
}
