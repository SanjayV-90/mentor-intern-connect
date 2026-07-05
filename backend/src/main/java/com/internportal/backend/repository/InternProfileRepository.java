package com.internportal.backend.repository;

import com.internportal.backend.domain.entity.InternProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface InternProfileRepository extends JpaRepository<InternProfile, UUID>, JpaSpecificationExecutor<InternProfile> {
    Optional<InternProfile> findByUserId(UUID userId);
    boolean existsByEmployeeId(String employeeId);
}
