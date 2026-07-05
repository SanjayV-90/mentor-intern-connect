package com.internportal.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceSummaryResponse {
    private long totalWorkingDays;
    private long presentDays;
    private long halfDays;
    private long absentDays;
    private long approvedLeaveDays;
    private double attendanceRate;
}
