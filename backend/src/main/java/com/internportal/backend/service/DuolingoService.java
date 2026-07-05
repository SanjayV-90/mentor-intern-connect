package com.internportal.backend.service;

import com.internportal.backend.domain.entity.DuolingoUpdate;
import com.internportal.backend.domain.entity.User;
import com.internportal.backend.dto.request.DuolingoUpdateRequest;
import com.internportal.backend.dto.response.DuolingoResponse;
import com.internportal.backend.exception.CustomException;
import com.internportal.backend.mapper.EntityMapper;
import com.internportal.backend.repository.DuolingoRepository;
import com.internportal.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DuolingoService {

    private final DuolingoRepository duolingoRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;
    private final EntityMapper entityMapper;

    @Transactional
    public DuolingoResponse updateDuolingoStreak(UUID internId, DuolingoUpdateRequest request, MultipartFile screenshot) {
        User intern = userRepository.findById(internId)
                .orElseThrow(() -> new CustomException("Intern not found", HttpStatus.NOT_FOUND));

        LocalDate today = LocalDate.now();
        String screenshotPath = null;
        if (screenshot != null && !screenshot.isEmpty()) {
            screenshotPath = storageService.storeFile(screenshot, "duolingo");
        }

        DuolingoUpdate update = duolingoRepository.findByInternIdAndUpdateDate(internId, today)
                .orElse(DuolingoUpdate.builder().intern(intern).updateDate(today).build());

        update.setCurrentStreak(request.getCurrentStreak());
        update.setLanguage(request.getLanguage());
        update.setXp(request.getXp());
        update.setDailyGoalCompleted(request.getDailyGoalCompleted() != null ? request.getDailyGoalCompleted() : true);
        if (screenshotPath != null) {
            update.setScreenshotUrl(screenshotPath);
        }

        DuolingoUpdate saved = duolingoRepository.save(update);
        return entityMapper.toDuolingoResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<DuolingoResponse> getMyDuolingoHistory(UUID internId) {
        return duolingoRepository.findByInternIdOrderByUpdateDateDesc(internId).stream()
                .map(entityMapper::toDuolingoResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DuolingoResponse> getAllDuolingoUpdates() {
        return duolingoRepository.findAll().stream()
                .map(entityMapper::toDuolingoResponse)
                .collect(Collectors.toList());
    }
}
