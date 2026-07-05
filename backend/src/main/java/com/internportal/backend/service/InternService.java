package com.internportal.backend.service;

import com.internportal.backend.domain.entity.InternProfile;
import com.internportal.backend.dto.request.InternProfileUpdateRequest;
import com.internportal.backend.dto.response.InternProfileResponse;
import com.internportal.backend.exception.CustomException;
import com.internportal.backend.mapper.EntityMapper;
import com.internportal.backend.repository.InternProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InternService {

    private final InternProfileRepository internProfileRepository;
    private final EntityMapper entityMapper;
    private final StorageService storageService;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public InternProfileResponse getMyProfile(UUID userId) {
        InternProfile profile = internProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException("Profile not found for current user", HttpStatus.NOT_FOUND));
        return entityMapper.toInternProfileResponse(profile);
    }

    @Transactional
    public InternProfileResponse updateMyProfile(UUID userId, InternProfileUpdateRequest request) {
        InternProfile profile = internProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException("Profile not found for current user", HttpStatus.NOT_FOUND));

        if (request.getPhone() != null) profile.setPhone(request.getPhone());
        if (request.getAddress() != null) profile.setAddress(request.getAddress());
        if (request.getCurrentTechStack() != null) profile.setCurrentTechStack(request.getCurrentTechStack());
        if (request.getPrimarySkill() != null) profile.setPrimarySkill(request.getPrimarySkill());
        if (request.getSecondarySkill() != null) profile.setSecondarySkill(request.getSecondarySkill());
        if (request.getGithubUrl() != null && !request.getGithubUrl().equals(profile.getGithubUrl())) {
            profile.setGithubUrl(request.getGithubUrl());
            notificationService.createNotificationForAdmins("GitHub Profile Updated", profile.getFullName() + " updated their GitHub URL.", "PROFILE");
        } else if (request.getGithubUrl() != null) {
            profile.setGithubUrl(request.getGithubUrl());
        }
        if (request.getLinkedinUrl() != null) profile.setLinkedinUrl(request.getLinkedinUrl());

        InternProfile saved = internProfileRepository.save(profile);
        return entityMapper.toInternProfileResponse(saved);
    }

    @Transactional
    public InternProfileResponse uploadResume(UUID userId, org.springframework.web.multipart.MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new CustomException("Please select a valid PDF file", HttpStatus.BAD_REQUEST);
        }
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new CustomException("Resume file size exceeds maximum limit of 10 MB", HttpStatus.BAD_REQUEST);
        }
        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "resume.pdf";
        if (!originalFilename.toLowerCase().endsWith(".pdf")) {
            throw new CustomException("Only PDF files are supported for Resume upload (invalid extension)", HttpStatus.BAD_REQUEST);
        }
        String contentType = file.getContentType();
        if (contentType != null && !contentType.isEmpty() && !contentType.equalsIgnoreCase("application/pdf") && !contentType.equalsIgnoreCase("application/x-pdf") && !contentType.equalsIgnoreCase("application/octet-stream")) {
            throw new CustomException("Only PDF files are supported for Resume upload (invalid MIME type: " + contentType + ")", HttpStatus.BAD_REQUEST);
        }

        InternProfile profile = internProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException("Profile not found", HttpStatus.NOT_FOUND));

        String oldResumeUrl = profile.getResumeUrl();
        String storedPath = storageService.storeFile(file, "resumes");

        try {
            profile.setResumeUrl(storedPath);
            profile.setResumeFileName(originalFilename);
            profile.setResumeUploadedAt(java.time.LocalDateTime.now());
            InternProfile saved = internProfileRepository.saveAndFlush(profile);

            if (oldResumeUrl != null && !oldResumeUrl.equals(storedPath)) {
                storageService.deleteFile(oldResumeUrl);
            }

            notificationService.createNotificationForAdmins("Resume Uploaded", profile.getFullName() + " uploaded a new resume (" + originalFilename + ").", "RESUME");
            return entityMapper.toInternProfileResponse(saved);
        } catch (Exception e) {
            storageService.deleteFile(storedPath);
            throw new CustomException("Failed to update database with new resume: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional
    public InternProfileResponse deleteResume(UUID userId) {
        InternProfile profile = internProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException("Profile not found", HttpStatus.NOT_FOUND));

        String oldResumeUrl = profile.getResumeUrl();
        profile.setResumeUrl(null);
        profile.setResumeFileName(null);
        profile.setResumeUploadedAt(null);

        InternProfile saved = internProfileRepository.saveAndFlush(profile);
        if (oldResumeUrl != null) {
            storageService.deleteFile(oldResumeUrl);
        }
        return entityMapper.toInternProfileResponse(saved);
    }

    @Transactional
    public InternProfileResponse uploadProfilePicture(UUID userId, org.springframework.web.multipart.MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new CustomException("Please select a valid image file", HttpStatus.BAD_REQUEST);
        }
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new CustomException("Profile photo file size exceeds maximum limit of 5 MB", HttpStatus.BAD_REQUEST);
        }
        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "avatar.png";
        String lower = originalFilename.toLowerCase();
        if (!lower.endsWith(".jpg") && !lower.endsWith(".jpeg") && !lower.endsWith(".png")) {
            throw new CustomException("Only JPG, JPEG, and PNG formats are supported for Profile Picture (invalid extension)", HttpStatus.BAD_REQUEST);
        }
        String contentType = file.getContentType();
        if (contentType != null && !contentType.isEmpty() && !contentType.equalsIgnoreCase("image/jpeg") && !contentType.equalsIgnoreCase("image/jpg") && !contentType.equalsIgnoreCase("image/png") && !contentType.equalsIgnoreCase("application/octet-stream")) {
            throw new CustomException("Only JPG, JPEG, and PNG formats are supported for Profile Picture (invalid MIME type: " + contentType + ")", HttpStatus.BAD_REQUEST);
        }

        InternProfile profile = internProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException("Profile not found", HttpStatus.NOT_FOUND));

        String oldPhotoUrl = profile.getProfilePictureUrl();
        String storedPath = storageService.storeFile(file, "avatars");

        try {
            profile.setProfilePictureUrl(storedPath);
            InternProfile saved = internProfileRepository.saveAndFlush(profile);

            if (oldPhotoUrl != null && !oldPhotoUrl.equals(storedPath)) {
                storageService.deleteFile(oldPhotoUrl);
            }

            notificationService.createNotificationForAdmins("Profile Picture Updated", profile.getFullName() + " updated their profile photo.", "PROFILE");
            return entityMapper.toInternProfileResponse(saved);
        } catch (Exception e) {
            storageService.deleteFile(storedPath);
            throw new CustomException("Failed to update database with new profile photo: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional
    public InternProfileResponse deleteProfilePicture(UUID userId) {
        InternProfile profile = internProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException("Profile not found", HttpStatus.NOT_FOUND));

        String oldPhotoUrl = profile.getProfilePictureUrl();
        profile.setProfilePictureUrl(null);

        InternProfile saved = internProfileRepository.saveAndFlush(profile);
        if (oldPhotoUrl != null) {
            storageService.deleteFile(oldPhotoUrl);
        }
        return entityMapper.toInternProfileResponse(saved);
    }
}
