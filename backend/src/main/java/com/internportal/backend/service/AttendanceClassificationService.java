package com.internportal.backend.service;

import com.internportal.backend.domain.entity.InternProfile;
import com.internportal.backend.domain.enums.AttendanceStatus;
import com.internportal.backend.exception.CustomException;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class AttendanceClassificationService {

    @Data
    @AllArgsConstructor
    public static class ClassificationResult {
        private AttendanceStatus status;
        private String workingHoursString;
        private double workedHoursDecimal;
    }

    public ClassificationResult classify(InternProfile profile, LocalDateTime checkInTime, LocalDateTime checkOutTime) {
        if (checkInTime == null || checkOutTime == null || checkOutTime.isBefore(checkInTime)) {
            throw new CustomException("Invalid check-in or check-out timestamps for classification.", HttpStatus.BAD_REQUEST);
        }

        double requiredHours = (profile != null && profile.getRequiredDailyHours() != null && profile.getRequiredDailyHours() > 0)
                ? profile.getRequiredDailyHours() : 8.0;

        Duration duration = Duration.between(checkInTime, checkOutTime);
        long hours = duration.toHours();
        long minutes = duration.toMinutesPart();
        String workingHoursStr = hours + "h " + minutes + "m";

        double workedHours = duration.toMillis() / (1000.0 * 60.0 * 60.0);
        double halfDayThreshold = requiredHours * 0.5;

        AttendanceStatus status;
        if (workedHours >= requiredHours) {
            status = AttendanceStatus.PRESENT;
        } else if (workedHours >= halfDayThreshold) {
            status = AttendanceStatus.HALF_DAY;
        } else {
            status = AttendanceStatus.ABSENT;
        }

        return new ClassificationResult(status, workingHoursStr, workedHours);
    }
}
