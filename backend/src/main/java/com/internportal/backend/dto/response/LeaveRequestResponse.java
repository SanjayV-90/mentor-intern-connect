package com.internportal.backend.dto.response;

import com.internportal.backend.domain.enums.LeaveStatus;
import com.internportal.backend.domain.enums.LeaveType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveRequestResponse {
    private UUID id;
    private UUID internId;
    private String internName;
    private String internEmail;
    private LeaveType leaveType;
    private LocalDate startDate;
    private LocalDate endDate;
    private long workingLeaveDays;
    private String reason;
    private LeaveStatus status;
    private String adminComment;
    private LocalDateTime requestedAt;
    private LocalDateTime reviewedAt;
    private String reviewedByName;
}
