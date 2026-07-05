package com.internportal.backend.dto.request;

import com.internportal.backend.domain.enums.LeaveStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveReviewDto {

    @NotNull(message = "Status is required (APPROVED or REJECTED)")
    private LeaveStatus status;

    private String adminComment;
}
