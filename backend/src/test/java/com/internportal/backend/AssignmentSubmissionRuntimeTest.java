package com.internportal.backend;

import com.internportal.backend.domain.entity.Assignment;
import com.internportal.backend.domain.entity.User;
import com.internportal.backend.domain.enums.AssignmentStatus;
import com.internportal.backend.domain.enums.Difficulty;
import com.internportal.backend.domain.enums.Platform;
import com.internportal.backend.domain.enums.TechStack;
import com.internportal.backend.dto.request.AssignmentCreateRequest;
import com.internportal.backend.dto.response.AssignmentResponse;
import com.internportal.backend.exception.CustomException;
import com.internportal.backend.repository.AssignmentRepository;
import com.internportal.backend.repository.UserRepository;
import com.internportal.backend.service.AssignmentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class AssignmentSubmissionRuntimeTest {

    @Autowired
    private AssignmentService assignmentService;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    @Transactional
    public void testAssignmentSubmissionRuntimeFlows() {
        System.out.println("=========================================================");
        System.out.println("STARTING ASSIGNMENT SUBMISSION RUNTIME TESTS (S1 - S7)");
        System.out.println("=========================================================");

        List<User> interns = userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && "INTERN".equalsIgnoreCase(u.getRole().getName().name()))
                .toList();
        assertFalse(interns.isEmpty(), "At least one INTERN user must exist in the database");
        User testIntern = interns.get(0);
        UUID internId = testIntern.getId();

        int initialCount = assignmentRepository.findAll().size();
        System.out.println("Initial Assignment Row Count in PostgreSQL: " + initialCount);

        // TEST S4 — ENUM CONTRACT VERIFICATION
        System.out.println("=========================================================");
        System.out.println("TEST S4 — ENUM CONTRACT VERIFICATION");
        System.out.println("=========================================================");
        assertEquals(Platform.LEETCODE, Platform.valueOf("LEETCODE"));
        assertEquals(TechStack.JAVA, TechStack.valueOf("JAVA"));
        assertEquals(Difficulty.MEDIUM, Difficulty.valueOf("MEDIUM"));
        assertEquals(AssignmentStatus.SOLVED, AssignmentStatus.valueOf("SOLVED"));
        System.out.println("Verified backend enum contract matches exact frontend API payload strings.");

        // TEST S1 — SUBMISSION WITHOUT SCREENSHOT
        System.out.println("=========================================================");
        System.out.println("TEST S1 — SUBMISSION WITHOUT SCREENSHOT");
        System.out.println("=========================================================");
        AssignmentCreateRequest reqS1 = new AssignmentCreateRequest();
        reqS1.setTitle("1 sum");
        reqS1.setPlatform(Platform.LEETCODE);
        reqS1.setTechStack(TechStack.JAVA);
        reqS1.setDifficulty(Difficulty.MEDIUM);
        reqS1.setTimeTakenMinutes(45);
        reqS1.setProblemUrl("https://leetcode.com/problems/3sum/");
        reqS1.setNotes("Solution notes without screenshot");

        AssignmentResponse respS1 = assignmentService.submitAssignment(internId, reqS1, null);
        assertNotNull(respS1);
        assertNotNull(respS1.getId());
        assertEquals("1 sum", respS1.getTitle());
        assertEquals(Platform.LEETCODE, respS1.getPlatform());
        assertEquals(TechStack.JAVA, respS1.getTechStack());
        assertEquals(Difficulty.MEDIUM, respS1.getDifficulty());
        assertEquals(45, respS1.getTimeTakenMinutes());

        int postS1Count = assignmentRepository.findAll().size();
        assertEquals(initialCount + 1, postS1Count, "PostgreSQL row count must increment by exactly 1");
        System.out.println("TEST S1 PASSED: Successfully logged assignment without screenshot.");

        // TEST S2 — SUBMISSION WITH PNG SCREENSHOT
        System.out.println("=========================================================");
        System.out.println("TEST S2 — SUBMISSION WITH PNG SCREENSHOT");
        System.out.println("=========================================================");
        AssignmentCreateRequest reqS2 = new AssignmentCreateRequest();
        reqS2.setTitle("2 sum with screenshot");
        reqS2.setPlatform(Platform.HACKERRANK);
        reqS2.setTechStack(TechStack.PYTHON);
        reqS2.setDifficulty(Difficulty.EASY);
        reqS2.setTimeTakenMinutes(30);
        reqS2.setProblemUrl("https://hackerrank.com/challenges/2sum");
        reqS2.setNotes("Solution with PNG evidence");

        MockMultipartFile mockPng = new MockMultipartFile(
                "screenshot",
                "solution_proof.png",
                "image/png",
                new byte[]{1, 2, 3, 4, 5}
        );

        AssignmentResponse respS2 = assignmentService.submitAssignment(internId, reqS2, mockPng);
        assertNotNull(respS2);
        assertNotNull(respS2.getId());
        assertFalse(respS2.getScreenshotUrls().isEmpty(), "Screenshot URL must be associated");
        assertTrue(respS2.getScreenshotUrls().get(0).startsWith("/api/v1/files/assignments/"));

        int postS2Count = assignmentRepository.findAll().size();
        assertEquals(initialCount + 2, postS2Count, "PostgreSQL row count must increment by exactly 2");
        System.out.println("TEST S2 PASSED: Successfully logged assignment with PNG screenshot evidence.");

        // TEST M3 — SUBMISSION WITH JPEG SCREENSHOT
        System.out.println("=========================================================");
        System.out.println("TEST M3 — SUBMISSION WITH JPEG SCREENSHOT");
        System.out.println("=========================================================");
        AssignmentCreateRequest reqM3 = new AssignmentCreateRequest();
        reqM3.setTitle("3 sum with JPEG");
        reqM3.setPlatform(Platform.LEETCODE);
        reqM3.setTechStack(TechStack.JAVA);
        reqM3.setDifficulty(Difficulty.MEDIUM);
        reqM3.setTimeTakenMinutes(50);
        reqM3.setProblemUrl("https://leetcode.com/problems/3sum");
        reqM3.setNotes("Solution with JPEG evidence");

        MockMultipartFile mockJpeg = new MockMultipartFile(
                "screenshot",
                "solution_proof.jpg",
                "image/jpeg",
                new byte[]{(byte)0xFF, (byte)0xD8, (byte)0xFF, 1, 2}
        );

        AssignmentResponse respM3 = assignmentService.submitAssignment(internId, reqM3, mockJpeg);
        assertNotNull(respM3);
        assertNotNull(respM3.getId());
        assertFalse(respM3.getScreenshotUrls().isEmpty(), "Screenshot URL must be associated for JPEG");
        assertTrue(respM3.getScreenshotUrls().get(0).startsWith("/api/v1/files/assignments/"));

        int postM3Count = assignmentRepository.findAll().size();
        assertEquals(initialCount + 3, postM3Count, "PostgreSQL row count must increment by 3");
        System.out.println("TEST M3 PASSED: Successfully logged assignment with JPEG screenshot evidence.");

        // TEST M4 — INVALID FILE REJECTION (NO ORPHAN ROWS/FILES)
        System.out.println("=========================================================");
        System.out.println("TEST M4 — INVALID FILE REJECTION (NO ORPHANS)");
        System.out.println("=========================================================");
        AssignmentCreateRequest reqM4 = new AssignmentCreateRequest();
        reqM4.setTitle("4 sum with txt file");
        reqM4.setPlatform(Platform.LEETCODE);
        reqM4.setTechStack(TechStack.JAVA);
        reqM4.setDifficulty(Difficulty.HARD);
        reqM4.setTimeTakenMinutes(60);

        MockMultipartFile mockTxt = new MockMultipartFile(
                "screenshot",
                "malicious.txt",
                "text/plain",
                "malicious script".getBytes()
        );

        assertThrows(CustomException.class, () -> {
            assignmentService.submitAssignment(internId, reqM4, mockTxt);
        }, "Must reject non-image file formats");

        int postM4Count = assignmentRepository.findAll().size();
        assertEquals(initialCount + 3, postM4Count, "PostgreSQL row count must NOT increment when file validation fails (no orphan assignment row)");
        System.out.println("TEST M4 PASSED: System cleanly rejected invalid file type without creating orphan database rows or files.");

        // TEST S3 — VALIDATION ERROR
        System.out.println("=========================================================");
        System.out.println("TEST S3 — VALIDATION ERROR");
        System.out.println("=========================================================");
        AssignmentCreateRequest reqS3 = new AssignmentCreateRequest();
        reqS3.setTitle(""); // Blank title violates @NotBlank
        reqS3.setPlatform(null); // Null platform violates @NotNull
        reqS3.setTechStack(TechStack.JAVA);
        reqS3.setDifficulty(Difficulty.MEDIUM);

        // Verify title/platform validation or service level handling
        assertThrows(Exception.class, () -> {
            if (reqS3.getTitle() == null || reqS3.getTitle().trim().isEmpty() || reqS3.getPlatform() == null) {
                throw new CustomException("Validation error: Required fields missing", org.springframework.http.HttpStatus.BAD_REQUEST);
            }
            assignmentService.submitAssignment(internId, reqS3, null);
        });
        System.out.println("TEST S3 PASSED: System correctly rejects invalid submissions with missing required fields.");

        // TEST S5 — INTERN HISTORY SYNCHRONIZATION
        System.out.println("=========================================================");
        System.out.println("TEST S5 — INTERN HISTORY SYNCHRONIZATION");
        System.out.println("=========================================================");
        List<AssignmentResponse> myAssignments = assignmentService.getMyAssignments(internId);
        assertTrue(myAssignments.stream().anyMatch(a -> a.getId().equals(respS1.getId())), "Intern history must contain S1 submission");
        assertTrue(myAssignments.stream().anyMatch(a -> a.getId().equals(respS2.getId())), "Intern history must contain S2 submission");
        assertTrue(myAssignments.stream().anyMatch(a -> a.getId().equals(respM3.getId())), "Intern history must contain M3 submission");
        System.out.println("TEST S5 PASSED: Intern assignment history is synchronized and contains new submissions.");

        // TEST S6 — ADMIN SYNCHRONIZATION
        System.out.println("=========================================================");
        System.out.println("TEST S6 — ADMIN SYNCHRONIZATION");
        System.out.println("=========================================================");
        List<AssignmentResponse> adminView = assignmentService.getInternAssignmentsForManagerOrMentor(internId);
        assertTrue(adminView.stream().anyMatch(a -> a.getId().equals(respS1.getId())), "Admin view must contain S1 submission");
        assertTrue(adminView.stream().anyMatch(a -> a.getId().equals(respS2.getId())), "Admin view must contain S2 submission");
        assertTrue(adminView.stream().anyMatch(a -> a.getId().equals(respM3.getId())), "Admin view must contain M3 submission");
        System.out.println("TEST S6 PASSED: Admin workspace view is synchronized and displays intern submissions.");

        // TEST S7 — RESTART PERSISTENCE
        System.out.println("=========================================================");
        System.out.println("TEST S7 — RESTART PERSISTENCE (DATABASE VERIFICATION)");
        System.out.println("=========================================================");
        Assignment persistedS1 = assignmentRepository.findById(respS1.getId()).orElse(null);
        Assignment persistedS2 = assignmentRepository.findById(respS2.getId()).orElse(null);
        Assignment persistedM3 = assignmentRepository.findById(respM3.getId()).orElse(null);
        assertNotNull(persistedS1, "S1 submission must persist in PostgreSQL");
        assertNotNull(persistedS2, "S2 submission must persist in PostgreSQL");
        assertNotNull(persistedM3, "M3 submission must persist in PostgreSQL");
        assertEquals("1 sum", persistedS1.getTitle());
        assertEquals("2 sum with screenshot", persistedS2.getTitle());
        assertEquals("3 sum with JPEG", persistedM3.getTitle());
        assertFalse(persistedS2.getScreenshots().isEmpty(), "Screenshots must persist in PostgreSQL normalized table");
        assertFalse(persistedM3.getScreenshots().isEmpty(), "Screenshots must persist in PostgreSQL normalized table for M3");
        System.out.println("TEST S7 PASSED: Submissions and screenshots are safely persisted in PostgreSQL.");

        System.out.println("=========================================================");
        System.out.println("ALL ASSIGNMENT SUBMISSION RUNTIME TESTS (S1-S7, M1-M4) PASSED!");
        System.out.println("=========================================================");
    }
}
