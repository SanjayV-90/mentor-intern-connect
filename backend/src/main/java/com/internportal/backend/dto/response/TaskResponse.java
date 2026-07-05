package com.internportal.backend.dto.response;

import com.internportal.backend.domain.enums.AssignedBy;
import com.internportal.backend.domain.enums.TaskPriority;
import com.internportal.backend.domain.enums.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskResponse {
    private UUID id;
    private UUID internId;
    private String internName;
    private String taskName;
    private String description;
    private String category;
    private AssignedBy assignedBy;
    private TaskPriority priority;
    private BigDecimal estimatedHours;
    private BigDecimal actualHours;
    private Integer progress;
    private TaskStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate completionDate;
    private String notes;
}
