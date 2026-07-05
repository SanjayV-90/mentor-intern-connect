package com.internportal.backend.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkScheduleUpdateDto {

    @NotNull(message = "Required daily hours cannot be null")
    @DecimalMin(value = "0.5", message = "Required daily hours must be at least 0.5 hours")
    @DecimalMax(value = "24.0", message = "Required daily hours cannot exceed 24.0 hours")
    private Double requiredDailyHours;
}
