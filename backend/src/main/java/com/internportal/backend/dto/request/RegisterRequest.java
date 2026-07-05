package com.internportal.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 150)
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid personal Gmail format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    private String gender;

    @NotNull(message = "Date of Birth is required")
    private LocalDate dob;

    @NotBlank(message = "Phone number is required")
    private String phone;

    @NotBlank(message = "Tech stack is required")
    private String techStack;

    @NotBlank(message = "College is required")
    private String college;

    @NotBlank(message = "Degree is required")
    private String degree;

    private String department;

    @NotBlank(message = "Address is required")
    private String address;

    private String primarySkill;
    private String secondarySkill;
    private String githubUrl;
    private String linkedinUrl;
}
