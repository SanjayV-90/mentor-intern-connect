package com.internportal.backend.dto.request;

import com.internportal.backend.domain.enums.TaskStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TaskProgressUpdateRequest {

    @NotNull(message = "Progress percentage is required")
    @Min(0)
    @Max(100)
    private Integer progress;

    @NotNull(message = "Task status is required")
    private TaskStatus status;

    private BigDecimal actualHours;
    private String remarks;
}
