package com.internportal.backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DuolingoUpdateRequest {

    @NotNull(message = "Current streak is required")
    @Min(0)
    private Integer currentStreak;

    @NotBlank(message = "Language is required")
    private String language;

    @NotNull(message = "XP is required")
    @Min(0)
    private Integer xp;

    private Boolean dailyGoalCompleted;
}
