package com.internportal.backend.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "duolingo_updates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class DuolingoUpdate {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "intern_id", nullable = false)
    private User intern;

    @Column(name = "current_streak", nullable = false)
    @Builder.Default
    private Integer currentStreak = 0;

    @Column(nullable = false, length = 100)
    private String language;

    @Column(nullable = false)
    @Builder.Default
    private Integer xp = 0;

    @Column(name = "daily_goal_completed", nullable = false)
    @Builder.Default
    private Boolean dailyGoalCompleted = true;

    @Column(name = "screenshot_url", length = 500)
    private String screenshotUrl;

    @Column(name = "update_date", nullable = false)
    @Builder.Default
    private LocalDate updateDate = LocalDate.now();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
