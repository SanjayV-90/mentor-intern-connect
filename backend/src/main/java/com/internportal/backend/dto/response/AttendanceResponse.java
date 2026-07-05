package com.internportal.backend.dto.response;

import com.internportal.backend.domain.enums.AttendanceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceResponse {
    private UUID id;
    private UUID internId;
    private String internName;
    private LocalDate attendanceDate;
    private LocalDateTime loginTime;
    private LocalDateTime logoutTime;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private String workingHours;
    private AttendanceStatus status;
    private String remarks;
}
