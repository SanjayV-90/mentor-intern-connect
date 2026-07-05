package com.internportal.backend.dto.request;

import lombok.Data;

@Data
public class InternProfileUpdateRequest {
    private String phone;
    private String address;
    private String currentTechStack;
    private String primarySkill;
    private String secondarySkill;
    private String githubUrl;
    private String linkedinUrl;
}
