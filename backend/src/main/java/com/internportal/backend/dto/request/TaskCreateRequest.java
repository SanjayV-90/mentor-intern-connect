package com.internportal.backend.dto.request;

import com.internportal.backend.domain.enums.TaskPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TaskCreateRequest {

    @NotBlank(message = "Task name is required")
    private String taskName;

    private String description;
    private String category;

    @NotNull(message = "Priority is required")
    private TaskPriority priority;

    private BigDecimal estimatedHours;
    private LocalDate startDate;
    private LocalDate endDate;
    private String notes;
}
