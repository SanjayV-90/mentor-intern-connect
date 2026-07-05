package com.internportal.backend.dto.response;

import com.internportal.backend.domain.enums.AssignmentStatus;
import com.internportal.backend.domain.enums.Difficulty;
import com.internportal.backend.domain.enums.Platform;
import com.internportal.backend.domain.enums.TechStack;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentResponse {
    private UUID id;
    private UUID internId;
    private String internName;
    private String title;
    private Platform platform;
    private String problemUrl;
    private TechStack techStack;
    private Difficulty difficulty;
    private Integer timeTakenMinutes;
    private AssignmentStatus status;
    private String notes;
    private LocalDate submissionDate;
    private List<String> screenshotUrls;
}
