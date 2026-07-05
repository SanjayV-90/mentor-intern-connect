package com.internportal.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DuolingoResponse {
    private UUID id;
    private UUID internId;
    private String internName;
    private Integer currentStreak;
    private Integer longestStreak;
    private String language;
    private Integer xp;
    private Double averageXp;
    private Boolean dailyGoalCompleted;
    private String screenshotUrl;
    private LocalDate updateDate;
}
