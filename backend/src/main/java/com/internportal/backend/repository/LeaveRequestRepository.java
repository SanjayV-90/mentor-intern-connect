package com.internportal.backend.repository;

import com.internportal.backend.domain.entity.LeaveRequest;
import com.internportal.backend.domain.enums.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, UUID> {

    List<LeaveRequest> findByInternIdOrderByRequestedAtDesc(UUID internId);

    List<LeaveRequest> findAllByOrderByRequestedAtDesc();

    List<LeaveRequest> findByStatusOrderByRequestedAtDesc(LeaveStatus status);

    List<LeaveRequest> findByInternIdAndStatusOrderByRequestedAtDesc(UUID internId, LeaveStatus status);

    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.intern.id = :internId AND lr.status IN ('PENDING', 'APPROVED') AND lr.startDate <= :endDate AND lr.endDate >= :startDate")
    List<LeaveRequest> findOverlappingActiveRequests(
            @Param("internId") UUID internId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}
