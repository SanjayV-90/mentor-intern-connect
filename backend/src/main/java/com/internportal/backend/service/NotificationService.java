package com.internportal.backend.service;

import com.internportal.backend.domain.entity.Notification;
import com.internportal.backend.domain.entity.User;
import com.internportal.backend.domain.enums.RoleType;
import com.internportal.backend.dto.response.NotificationResponse;
import com.internportal.backend.exception.CustomException;
import com.internportal.backend.repository.NotificationRepository;
import com.internportal.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional
    public void createNotificationForAdmins(String title, String message, String type) {
        try {
            List<User> admins = userRepository.findAll().stream()
                    .filter(u -> !u.isDeleted() && u.getRole() != null && u.getRole().getName() == RoleType.ADMIN)
                    .collect(Collectors.toList());

            for (User admin : admins) {
                Notification notification = Notification.builder()
                        .recipient(admin)
                        .title(title)
                        .message(message)
                        .type(type)
                        .read(false)
                        .createdAt(LocalDateTime.now())
                        .build();
                notificationRepository.save(notification);
            }
        } catch (Exception e) {
            log.error("Failed to send notification to admins: {}", e.getMessage());
        }
    }

    @Transactional
    public void createNotificationForUser(User recipient, String title, String message, String type) {
        try {
            if (recipient != null && !recipient.isDeleted()) {
                Notification notification = Notification.builder()
                        .recipient(recipient)
                        .title(title)
                        .message(message)
                        .type(type)
                        .read(false)
                        .createdAt(LocalDateTime.now())
                        .build();
                notificationRepository.save(notification);
            }
        } catch (Exception e) {
            log.error("Failed to send notification to user: {}", e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(UUID userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getAdminNotifications(UUID adminId) {
        return getUserNotifications(adminId);
    }

    @Transactional
    public NotificationResponse markAsRead(UUID userId, UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new CustomException("Notification not found", HttpStatus.NOT_FOUND));
        if (!notification.getRecipient().getId().equals(userId)) {
            throw new CustomException("You do not have permission to access this notification", HttpStatus.FORBIDDEN);
        }
        notification.setRead(true);
        return toResponse(notificationRepository.save(notification));
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        List<Notification> unread = notificationRepository.findByRecipientIdAndReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
