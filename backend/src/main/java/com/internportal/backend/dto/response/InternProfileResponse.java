package com.internportal.backend.dto.response;

import com.internportal.backend.domain.enums.AccountStatus;
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
public class InternProfileResponse {
    private UUID userId;
    private UUID profileId;
    private String employeeId;
    private String email;
    private AccountStatus status;
    private String fullName;
    private String gender;
    private LocalDate dob;
    private String phone;
    private String address;
    private String college;
    private String degree;
    private String department;
    private LocalDate joiningDate;
    private LocalDate expectedEndDate;
    private String currentTechStack;
    private String primarySkill;
    private String secondarySkill;
    private String githubUrl;
    private String linkedinUrl;
    private String profilePictureUrl;
    private Double requiredDailyHours;
    private String resumeUrl;
    private String resumeFileName;
    private java.time.LocalDateTime resumeUploadedAt;
}
