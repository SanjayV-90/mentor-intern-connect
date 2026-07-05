package com.internportal.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardAnalyticsResponse {
    private long totalInterns;
    private long pendingApprovalCount;
    private long activeInternsCount;
    private double overallAttendancePercentage;
    private long totalAssignmentsCompleted;
    private double totalLearningHours;
    private double averageDuolingoStreak;
    private long totalTasksCompleted;

    // Charts data
    private Map<String, Long> attendanceTrend;
    private Map<String, Long> assignmentsByTechStack;
    private Map<String, Long> assignmentsByPlatform;
    private Map<String, Long> dailyTaskCompletionStatus;
    private Map<String, Double> learningHoursPerIntern;
    private Map<String, Integer> duolingoStreakRanking;
}
