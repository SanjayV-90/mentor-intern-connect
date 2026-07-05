package com.internportal.backend.service;

import com.internportal.backend.exception.CustomException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;

@Service
@Slf4j
public class LocalStorageServiceImpl implements StorageService {

    @Value("${app.storage.upload-dir:./uploads}")
    private String uploadDir;

    @PostConstruct
    public void init() {
        try {
            Path root = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(root);
            log.info("Initialized local storage directory at absolute path: {}", root);
        } catch (IOException e) {
            throw new CustomException("Could not initialize storage directory", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public String storeFile(MultipartFile file, String category) {
        if (file.isEmpty()) {
            throw new CustomException("Cannot store empty file", HttpStatus.BAD_REQUEST);
        }

        String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        if (originalFilename.contains("..")) {
            throw new CustomException("Filename contains invalid path sequence " + originalFilename, HttpStatus.BAD_REQUEST);
        }

        try {
            Path root = Paths.get(uploadDir).toAbsolutePath().normalize();
            Path categoryDir = root.resolve(category).normalize();
            if (!categoryDir.startsWith(root)) {
                throw new CustomException("Cannot store file outside upload directory", HttpStatus.BAD_REQUEST);
            }
            Files.createDirectories(categoryDir);

            String extension = "";
            int dotIndex = originalFilename.lastIndexOf('.');
            if (dotIndex > 0) {
                extension = originalFilename.substring(dotIndex).toLowerCase();
            }

            String storedFilename = UUID.randomUUID().toString() + extension;
            Path targetLocation = categoryDir.resolve(storedFilename).normalize();
            if (!targetLocation.startsWith(categoryDir)) {
                throw new CustomException("Cannot store file outside category directory", HttpStatus.BAD_REQUEST);
            }
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return "/api/v1/files/" + category + "/" + storedFilename;
        } catch (IOException ex) {
            throw new CustomException("Could not store file " + originalFilename + ". Please try again!", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public void deleteFile(String fileUrl) {
        if (!StringUtils.hasText(fileUrl) || !fileUrl.startsWith("/api/v1/files/")) {
            log.warn("Invalid or non-local file URL provided for deletion: {}", fileUrl);
            return;
        }
        try {
            String relativePath = fileUrl.substring("/api/v1/files/".length());
            if (relativePath.contains("..")) {
                log.warn("Path traversal attempt detected during deletion: {}", fileUrl);
                return;
            }
            Path root = Paths.get(uploadDir).toAbsolutePath().normalize();
            Path filePath = root.resolve(relativePath).normalize();
            if (!filePath.startsWith(root)) {
                log.warn("Cannot delete file outside upload directory: {}", fileUrl);
                return;
            }
            boolean deleted = Files.deleteIfExists(filePath);
            if (deleted) {
                log.info("Successfully deleted stored file: {}", filePath);
            } else {
                log.warn("File to delete not found on disk: {}", filePath);
            }
        } catch (Exception e) {
            log.warn("Failed to delete stored file from disk: {}", fileUrl, e);
        }
    }
}
