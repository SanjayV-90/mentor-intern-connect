package com.internportal.backend.dto.request;

import com.internportal.backend.domain.enums.AttendanceStatus;
import lombok.Data;

@Data
public class AttendanceCheckInRequest {
    private AttendanceStatus status;
    private String remarks;
}
