package com.internportal.backend.service;

import com.internportal.backend.domain.entity.Attendance;
import com.internportal.backend.domain.entity.LeaveRequest;
import com.internportal.backend.domain.enums.AttendanceStatus;
import com.internportal.backend.domain.enums.LeaveStatus;
import com.internportal.backend.repository.AttendanceRepository;
import com.internportal.backend.repository.LeaveRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BusinessCalendarService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final AttendanceRepository attendanceRepository;

    public long calculateWorkingDays(LocalDate start, LocalDate end) {
        if (start == null || end == null || start.isAfter(end)) {
            return 0;
        }
        long count = 0;
        LocalDate curr = start;
        while (!curr.isAfter(end)) {
            DayOfWeek dow = curr.getDayOfWeek();
            if (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY) {
                count++;
            }
            curr = curr.plusDays(1);
        }
        return count;
    }

    public long calculateWorkingLeaveDays(LocalDate start, LocalDate end) {
        return calculateWorkingDays(start, end);
    }

    @Transactional(readOnly = true)
    public long calculateApprovedLeaveDays(UUID internId, LocalDate fromDate, LocalDate toDate) {
        if (internId == null || fromDate == null || toDate == null || fromDate.isAfter(toDate)) {
            return 0;
        }

        List<LeaveRequest> approvedLeaves = leaveRequestRepository.findByInternIdAndStatusOrderByRequestedAtDesc(internId, LeaveStatus.APPROVED);
        if (approvedLeaves.isEmpty()) {
            return 0;
        }

        List<Attendance> attendances = attendanceRepository.findByInternIdAndAttendanceDateBetween(internId, fromDate, toDate);
        Set<LocalDate> completedPresenceDates = new HashSet<>();
        for (Attendance att : attendances) {
            boolean isCompleted = att.getCheckOutTime() != null || att.getLogoutTime() != null;
            if (isCompleted && (att.getStatus() == AttendanceStatus.PRESENT || att.getStatus() == AttendanceStatus.HALF_DAY)) {
                completedPresenceDates.add(att.getAttendanceDate());
            }
        }

        long count = 0;
        LocalDate curr = fromDate;
        while (!curr.isAfter(toDate)) {
            DayOfWeek dow = curr.getDayOfWeek();
            // Rule 1: Working days only (Monday-Friday). Do NOT use calendar-day fallback!
            if (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY) {
                final LocalDate targetDate = curr;
                // Rule 3: Only check dates up to toDate (which is LocalDate.now() in current KPI)
                boolean isCoveredByApprovedLeave = approvedLeaves.stream().anyMatch(req ->
                        !targetDate.isBefore(req.getStartDate()) && !targetDate.isAfter(req.getEndDate())
                );
                if (isCoveredByApprovedLeave) {
                    // Rule 2: Correct attendance conflict precedence.
                    // If completed status is PRESENT or HALF_DAY, actual attendance takes precedence -> contribution = 0.
                    // If ABSENT or unfinished session, row existence is NOT treated as presence -> contribution counts!
                    if (!completedPresenceDates.contains(targetDate)) {
                        count++;
                    }
                }
            }
            curr = curr.plusDays(1);
        }
        return count;
    }
}
