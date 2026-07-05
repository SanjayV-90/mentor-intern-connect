package com.internportal.backend.service;

import com.internportal.backend.domain.entity.DailyTask;
import com.internportal.backend.domain.entity.TaskProgressHistory;
import com.internportal.backend.domain.entity.User;
import com.internportal.backend.domain.enums.AssignedBy;
import com.internportal.backend.domain.enums.TaskStatus;
import com.internportal.backend.dto.request.TaskCreateRequest;
import com.internportal.backend.dto.request.TaskProgressUpdateRequest;
import com.internportal.backend.dto.response.TaskResponse;
import com.internportal.backend.exception.CustomException;
import com.internportal.backend.mapper.EntityMapper;
import com.internportal.backend.repository.DailyTaskRepository;
import com.internportal.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final DailyTaskRepository dailyTaskRepository;
    private final UserRepository userRepository;
    private final EntityMapper entityMapper;
    private final NotificationService notificationService;

    @Transactional
    public TaskResponse createTask(UUID internId, TaskCreateRequest request) {
        User intern = userRepository.findById(internId)
                .orElseThrow(() -> new CustomException("Intern not found", HttpStatus.NOT_FOUND));

        DailyTask task = DailyTask.builder()
                .intern(intern)
                .taskName(request.getTaskName())
                .description(request.getDescription())
                .category(request.getCategory())
                .assignedBy(AssignedBy.SELF)
                .priority(request.getPriority())
                .estimatedHours(request.getEstimatedHours())
                .progress(0)
                .status(TaskStatus.PENDING)
                .startDate(request.getStartDate() != null ? request.getStartDate() : LocalDate.now())
                .endDate(request.getEndDate())
                .notes(request.getNotes())
                .deleted(false)
                .build();

        DailyTask saved = dailyTaskRepository.save(task);
        return entityMapper.toTaskResponse(saved);
    }

    @Transactional
    public TaskResponse updateProgress(UUID taskId, TaskProgressUpdateRequest request) {
        DailyTask task = dailyTaskRepository.findById(taskId)
                .orElseThrow(() -> new CustomException("Task not found with ID: " + taskId, HttpStatus.NOT_FOUND));

        int oldProgress = task.getProgress();
        String oldStatus = task.getStatus().name();

        task.setProgress(request.getProgress());
        task.setStatus(request.getStatus());
        if (request.getActualHours() != null) {
            task.setActualHours(request.getActualHours());
        }
        if (request.getStatus() == TaskStatus.COMPLETED && task.getCompletionDate() == null) {
            task.setCompletionDate(LocalDate.now());
        }

        TaskProgressHistory history = TaskProgressHistory.builder()
                .task(task)
                .oldProgress(oldProgress)
                .newProgress(request.getProgress())
                .oldStatus(oldStatus)
                .newStatus(request.getStatus().name())
                .remarks(request.getRemarks())
                .recordedAt(LocalDateTime.now())
                .build();

        task.getProgressHistory().add(history);
        DailyTask saved = dailyTaskRepository.save(task);

        if (request.getStatus() == TaskStatus.COMPLETED && !oldStatus.equals("COMPLETED")) {
            String internName = task.getIntern().getInternProfile() != null ? task.getIntern().getInternProfile().getFullName() : task.getIntern().getEmail();
            notificationService.createNotificationForAdmins("Daily Task Completed", internName + " completed task: " + task.getTaskName(), "TASK");
        }
        return entityMapper.toTaskResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getMyTasks(UUID internId) {
        return dailyTaskRepository.findByInternIdOrderByCreatedAtDesc(internId).stream()
                .map(entityMapper::toTaskResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getAllTasks() {
        return dailyTaskRepository.findAll().stream()
                .map(entityMapper::toTaskResponse)
                .collect(Collectors.toList());
    }
}
