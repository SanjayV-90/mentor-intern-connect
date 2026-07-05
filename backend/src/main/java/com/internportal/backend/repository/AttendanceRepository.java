package com.internportal.backend.repository;

import com.internportal.backend.domain.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, UUID>, JpaSpecificationExecutor<Attendance> {
    Optional<Attendance> findByInternIdAndAttendanceDate(UUID internId, LocalDate attendanceDate);
    List<Attendance> findByInternIdOrderByAttendanceDateDesc(UUID internId);
    List<Attendance> findByInternIdAndAttendanceDateBetween(UUID internId, LocalDate startDate, LocalDate endDate);
    List<Attendance> findByAttendanceDate(LocalDate attendanceDate);
}
