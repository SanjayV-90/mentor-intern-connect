package com.internportal.backend.dto.response;

import com.internportal.backend.domain.enums.AccountStatus;
import com.internportal.backend.domain.enums.RoleType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private UUID userId;
    private String email;
    private RoleType role;
    private AccountStatus status;
    private String fullName;
    private String profilePictureUrl;
}
