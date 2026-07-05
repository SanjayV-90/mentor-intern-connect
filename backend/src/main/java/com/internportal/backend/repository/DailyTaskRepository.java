package com.internportal.backend.repository;

import com.internportal.backend.domain.entity.DailyTask;
import com.internportal.backend.domain.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DailyTaskRepository extends JpaRepository<DailyTask, UUID>, JpaSpecificationExecutor<DailyTask> {
    List<DailyTask> findByInternIdOrderByCreatedAtDesc(UUID internId);
    List<DailyTask> findByInternIdAndStatus(UUID internId, TaskStatus status);
}
