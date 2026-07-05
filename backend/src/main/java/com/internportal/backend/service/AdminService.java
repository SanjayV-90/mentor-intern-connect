package com.internportal.backend.service;

import com.internportal.backend.domain.entity.InternProfile;
import com.internportal.backend.domain.entity.User;
import com.internportal.backend.domain.enums.AccountStatus;
import com.internportal.backend.domain.enums.RoleType;
import com.internportal.backend.dto.response.InternProfileResponse;
import com.internportal.backend.exception.CustomException;
import com.internportal.backend.mapper.EntityMapper;
import com.internportal.backend.repository.InternProfileRepository;
import com.internportal.backend.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UserRepository userRepository;
    private final InternProfileRepository internProfileRepository;
    private final EntityMapper entityMapper;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public Page<InternProfileResponse> getAllInterns(AccountStatus status, String search, Pageable pageable) {
        Specification<InternProfile> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("user").get("role").get("name"), RoleType.INTERN));
            predicates.add(cb.equal(root.get("user").get("deleted"), false));

            if (status != null) {
                predicates.add(cb.equal(root.get("user").get("status"), status));
            }

            if (StringUtils.hasText(search)) {
                String searchLike = "%" + search.toLowerCase() + "%";
                Predicate namePred = cb.like(cb.lower(root.get("fullName")), searchLike);
                Predicate emailPred = cb.like(cb.lower(root.get("user").get("email")), searchLike);
                Predicate collegePred = cb.like(cb.lower(root.get("college")), searchLike);
                Predicate techPred = cb.like(cb.lower(root.get("currentTechStack")), searchLike);
                predicates.add(cb.or(namePred, emailPred, collegePred, techPred));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return internProfileRepository.findAll(spec, pageable).map(entityMapper::toInternProfileResponse);
    }

    @Transactional(readOnly = true)
    public InternProfileResponse getInternById(UUID id) {
        InternProfile profile = internProfileRepository.findByUserId(id)
                .orElseThrow(() -> new CustomException("Intern profile not found for user ID: " + id, HttpStatus.NOT_FOUND));
        return entityMapper.toInternProfileResponse(profile);
    }

    @Transactional
    public InternProfileResponse approveIntern(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("User not found with ID: " + userId, HttpStatus.NOT_FOUND));

        if (user.getStatus() == AccountStatus.ACTIVE) {
            throw new CustomException("Intern is already active!", HttpStatus.BAD_REQUEST);
        }

        user.setStatus(AccountStatus.ACTIVE);
        userRepository.save(user);

        InternProfile profile = internProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException("Profile missing for intern", HttpStatus.NOT_FOUND));

        return entityMapper.toInternProfileResponse(profile);
    }

    @Transactional
    public InternProfileResponse rejectIntern(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("User not found with ID: " + userId, HttpStatus.NOT_FOUND));

        user.setStatus(AccountStatus.REJECTED);
        userRepository.save(user);

        InternProfile profile = internProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException("Profile missing for intern", HttpStatus.NOT_FOUND));

        return entityMapper.toInternProfileResponse(profile);
    }

    @Transactional
    public InternProfileResponse disableIntern(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("User not found with ID: " + userId, HttpStatus.NOT_FOUND));

        user.setStatus(AccountStatus.DISABLED);
        userRepository.save(user);

        InternProfile profile = internProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException("Profile missing for intern", HttpStatus.NOT_FOUND));

        return entityMapper.toInternProfileResponse(profile);
    }

    @Transactional
    public InternProfileResponse updateWorkSchedule(UUID userId, com.internportal.backend.dto.request.WorkScheduleUpdateDto dto) {
        InternProfile profile = internProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException("Intern profile not found for user ID: " + userId, HttpStatus.NOT_FOUND));

        profile.setRequiredDailyHours(dto.getRequiredDailyHours());
        InternProfile saved = internProfileRepository.save(profile);

        notificationService.createNotificationForUser(
                profile.getUser(),
                "Working Hours Updated",
                "Your required daily working hours have been updated to " + dto.getRequiredDailyHours() + " hours.",
                "SCHEDULE"
        );

        return entityMapper.toInternProfileResponse(saved);
    }
}
