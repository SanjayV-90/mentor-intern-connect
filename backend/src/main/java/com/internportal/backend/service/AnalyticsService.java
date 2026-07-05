package com.internportal.backend.service;

import com.internportal.backend.domain.entity.Assignment;
import com.internportal.backend.domain.entity.Attendance;
import com.internportal.backend.domain.entity.DailyTask;
import com.internportal.backend.domain.entity.DuolingoUpdate;
import com.internportal.backend.domain.entity.User;
import com.internportal.backend.domain.enums.AccountStatus;
import com.internportal.backend.domain.enums.AttendanceStatus;
import com.internportal.backend.domain.enums.RoleType;
import com.internportal.backend.domain.enums.TaskStatus;
import com.internportal.backend.dto.response.AdminDashboardAnalyticsResponse;
import com.internportal.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final UserRepository userRepository;
    private final AttendanceRepository attendanceRepository;
    private final AssignmentRepository assignmentRepository;
    private final DuolingoRepository duolingoRepository;
    private final DailyTaskRepository dailyTaskRepository;

    @Transactional(readOnly = true)
    public AdminDashboardAnalyticsResponse getDashboardAnalytics() {
        List<User> interns = userRepository.findAll().stream()
                .filter(u -> !u.isDeleted() && u.getRole().getName() == RoleType.INTERN)
                .collect(Collectors.toList());

        long totalInterns = interns.size();
        long pendingCount = interns.stream().filter(u -> u.getStatus() == AccountStatus.PENDING_APPROVAL).count();
        long activeCount = interns.stream().filter(u -> u.getStatus() == AccountStatus.ACTIVE).count();

        List<Attendance> allAttendance = attendanceRepository.findAll();
        long presentOrHalf = allAttendance.stream()
                .filter(a -> (a.getStatus() == AttendanceStatus.PRESENT || a.getStatus() == AttendanceStatus.HALF_DAY)
                          && (a.getCheckOutTime() != null || a.getLogoutTime() != null || !"In Progress".equals(a.getWorkingHours())))
                .count();
        double attendancePercent = allAttendance.isEmpty() ? 100.0 : ((double) presentOrHalf / allAttendance.size()) * 100.0;

        List<Assignment> allAssignments = assignmentRepository.findAll();
        long completedAssignments = allAssignments.size();
        double totalLearningHours = allAssignments.stream()
                .mapToInt(a -> a.getTimeTakenMinutes() != null ? a.getTimeTakenMinutes() : 0)
                .sum() / 60.0;

        List<DuolingoUpdate> duolingos = duolingoRepository.findAll();
        double avgStreak = duolingos.isEmpty() ? 0.0 : duolingos.stream().mapToInt(DuolingoUpdate::getCurrentStreak).average().orElse(0.0);

        List<DailyTask> allTasks = dailyTaskRepository.findAll();
        long completedTasks = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();

        // Chart 1: Attendance Trend
        Map<String, Long> attendanceTrend = allAttendance.stream()
                .collect(Collectors.groupingBy(a -> a.getAttendanceDate().toString(), Collectors.counting()));

        // Chart 2: Assignments by Tech Stack
        Map<String, Long> assignmentsByTechStack = allAssignments.stream()
                .collect(Collectors.groupingBy(a -> a.getTechStack().name(), Collectors.counting()));

        // Chart 3: Assignments by Platform
        Map<String, Long> assignmentsByPlatform = allAssignments.stream()
                .collect(Collectors.groupingBy(a -> a.getPlatform().name(), Collectors.counting()));

        // Chart 4: Daily Task Completion Status
        Map<String, Long> dailyTaskStatus = allTasks.stream()
                .collect(Collectors.groupingBy(t -> t.getStatus().name(), Collectors.counting()));

        // Chart 5: Learning Hours per Intern
        Map<String, Double> learningHoursPerIntern = new HashMap<>();
        for (Assignment a : allAssignments) {
            String internName = a.getIntern().getInternProfile() != null ? a.getIntern().getInternProfile().getFullName() : a.getIntern().getEmail();
            double hours = (a.getTimeTakenMinutes() != null ? a.getTimeTakenMinutes() : 0) / 60.0;
            learningHoursPerIntern.put(internName, learningHoursPerIntern.getOrDefault(internName, 0.0) + hours);
        }

        // Chart 6: Duolingo Streak Ranking
        Map<String, Integer> duolingoRanking = new HashMap<>();
        for (DuolingoUpdate d : duolingos) {
            String internName = d.getIntern().getInternProfile() != null ? d.getIntern().getInternProfile().getFullName() : d.getIntern().getEmail();
            duolingoRanking.put(internName, Math.max(duolingoRanking.getOrDefault(internName, 0), d.getCurrentStreak()));
        }

        return AdminDashboardAnalyticsResponse.builder()
                .totalInterns(totalInterns)
                .pendingApprovalCount(pendingCount)
                .activeInternsCount(activeCount)
                .overallAttendancePercentage(Math.round(attendancePercent * 100.0) / 100.0)
                .totalAssignmentsCompleted(completedAssignments)
                .totalLearningHours(Math.round(totalLearningHours * 100.0) / 100.0)
                .averageDuolingoStreak(Math.round(avgStreak * 10.0) / 10.0)
                .totalTasksCompleted(completedTasks)
                .attendanceTrend(attendanceTrend)
                .assignmentsByTechStack(assignmentsByTechStack)
                .assignmentsByPlatform(assignmentsByPlatform)
                .dailyTaskCompletionStatus(dailyTaskStatus)
                .learningHoursPerIntern(learningHoursPerIntern)
                .duolingoStreakRanking(duolingoRanking)
                .build();
    }
}
