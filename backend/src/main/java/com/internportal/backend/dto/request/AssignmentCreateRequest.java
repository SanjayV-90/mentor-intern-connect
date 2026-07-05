package com.internportal.backend.dto.request;

import com.internportal.backend.domain.enums.AssignmentStatus;
import com.internportal.backend.domain.enums.Difficulty;
import com.internportal.backend.domain.enums.Platform;
import com.internportal.backend.domain.enums.TechStack;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignmentCreateRequest {

    private java.util.UUID id;

    @NotBlank(message = "Title is required")
    private String title;

    @NotNull(message = "Platform is required")
    private Platform platform;

    private String problemUrl;

    @NotNull(message = "Tech stack is required")
    private TechStack techStack;

    @NotNull(message = "Difficulty is required")
    private Difficulty difficulty;

    private Integer timeTakenMinutes;

    private AssignmentStatus status;

    private String notes;
}
