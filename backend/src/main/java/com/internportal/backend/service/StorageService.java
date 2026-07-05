package com.internportal.backend.service;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    String storeFile(MultipartFile file, String category);
    void deleteFile(String fileUrl);
}
