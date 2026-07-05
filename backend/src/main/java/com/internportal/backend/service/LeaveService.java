package com.internportal.backend.service;

import com.internportal.backend.domain.entity.LeaveRequest;
import com.internportal.backend.domain.entity.User;
import com.internportal.backend.domain.enums.LeaveStatus;
import com.internportal.backend.dto.request.LeaveRequestCreateDto;
import com.internportal.backend.dto.request.LeaveReviewDto;
import com.internportal.backend.dto.response.LeaveRequestResponse;
import com.internportal.backend.exception.CustomException;
import com.internportal.backend.mapper.EntityMapper;
import com.internportal.backend.repository.LeaveRequestRepository;
import com.internportal.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final EntityMapper entityMapper;

    @Transactional
    public LeaveRequestResponse submitLeaveRequest(UUID internId, LeaveRequestCreateDto dto) {
        if (dto.getStartDate().isAfter(dto.getEndDate())) {
            throw new CustomException("Start date cannot be after end date", HttpStatus.BAD_REQUEST);
        }

        User intern = userRepository.findById(internId)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));

        List<LeaveRequest> overlapping = leaveRequestRepository.findOverlappingActiveRequests(internId, dto.getStartDate(), dto.getEndDate());
        if (!overlapping.isEmpty()) {
            throw new CustomException("You already have an active leave request overlapping this date range.", HttpStatus.BAD_REQUEST);
        }

        LeaveRequest leaveRequest = LeaveRequest.builder()
                .intern(intern)
                .leaveType(dto.getLeaveType())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .reason(dto.getReason())
                .status(LeaveStatus.PENDING)
                .requestedAt(LocalDateTime.now())
                .build();

        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
        String internName = intern.getInternProfile() != null ? intern.getInternProfile().getFullName() : intern.getEmail();
        notificationService.createNotificationForAdmins(
                "New Leave Request",
                internName + " applied for " + dto.getLeaveType() + " leave from " + dto.getStartDate() + " to " + dto.getEndDate() + ".",
                "LEAVE"
        );

        return entityMapper.toLeaveRequestResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<LeaveRequestResponse> getInternLeaveRequests(UUID internId) {
        return leaveRequestRepository.findByInternIdOrderByRequestedAtDesc(internId).stream()
                .map(entityMapper::toLeaveRequestResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public LeaveRequestResponse cancelLeaveRequest(UUID internId, UUID leaveId) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new CustomException("Leave request not found", HttpStatus.NOT_FOUND));

        if (!leaveRequest.getIntern().getId().equals(internId)) {
            throw new CustomException("You are not authorized to cancel this leave request.", HttpStatus.FORBIDDEN);
        }

        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new CustomException("Only PENDING leave requests can be cancelled.", HttpStatus.BAD_REQUEST);
        }

        leaveRequest.setStatus(LeaveStatus.CANCELLED);
        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
        return entityMapper.toLeaveRequestResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<LeaveRequestResponse> getAllLeaveRequests(UUID internIdFilter, LeaveStatus statusFilter) {
        List<LeaveRequest> requests;
        if (internIdFilter != null && statusFilter != null) {
            requests = leaveRequestRepository.findByInternIdAndStatusOrderByRequestedAtDesc(internIdFilter, statusFilter);
        } else if (internIdFilter != null) {
            requests = leaveRequestRepository.findByInternIdOrderByRequestedAtDesc(internIdFilter);
        } else if (statusFilter != null) {
            requests = leaveRequestRepository.findByStatusOrderByRequestedAtDesc(statusFilter);
        } else {
            requests = leaveRequestRepository.findAllByOrderByRequestedAtDesc();
        }
        return requests.stream()
                .map(entityMapper::toLeaveRequestResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LeaveRequestResponse getLeaveRequestById(UUID leaveId) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new CustomException("Leave request not found", HttpStatus.NOT_FOUND));
        return entityMapper.toLeaveRequestResponse(leaveRequest);
    }

    @Transactional
    public LeaveRequestResponse reviewLeaveRequest(UUID adminId, UUID leaveId, LeaveReviewDto dto) {
        if (dto.getStatus() != LeaveStatus.APPROVED && dto.getStatus() != LeaveStatus.REJECTED) {
            throw new CustomException("Review status must be either APPROVED or REJECTED.", HttpStatus.BAD_REQUEST);
        }

        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new CustomException("Leave request not found", HttpStatus.NOT_FOUND));

        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new CustomException("This leave request has already been reviewed or cancelled.", HttpStatus.BAD_REQUEST);
        }

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new CustomException("Admin user not found", HttpStatus.NOT_FOUND));

        leaveRequest.setStatus(dto.getStatus());
        leaveRequest.setAdminComment(dto.getAdminComment());
        leaveRequest.setReviewedAt(LocalDateTime.now());
        leaveRequest.setReviewedBy(admin);

        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);

        String commentText = dto.getAdminComment() != null && !dto.getAdminComment().trim().isEmpty()
                ? " Comment: " + dto.getAdminComment()
                : "";
        notificationService.createNotificationForUser(
                leaveRequest.getIntern(),
                "Leave Request " + dto.getStatus(),
                "Your " + leaveRequest.getLeaveType() + " leave request for " + leaveRequest.getStartDate() + " to " + leaveRequest.getEndDate() + " has been " + dto.getStatus() + "." + commentText,
                "LEAVE"
        );

        return entityMapper.toLeaveRequestResponse(saved);
    }
}
