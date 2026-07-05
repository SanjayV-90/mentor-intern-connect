package com.internportal.backend.config;

import com.internportal.backend.domain.entity.*;
import com.internportal.backend.domain.enums.*;
import com.internportal.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final InternProfileRepository internProfileRepository;
    private final AttendanceRepository attendanceRepository;
    private final AssignmentRepository assignmentRepository;
    private final DuolingoRepository duolingoRepository;
    private final DailyTaskRepository dailyTaskRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Initializing system seed data if database is empty...");

        Role adminRole = roleRepository.findByName(RoleType.ADMIN).orElseGet(() ->
                roleRepository.save(Role.builder().name(RoleType.ADMIN).description("System Batch Manager").build()));

        Role internRole = roleRepository.findByName(RoleType.INTERN).orElseGet(() ->
                roleRepository.save(Role.builder().name(RoleType.INTERN).description("Intern Engineer").build()));

        if (userRepository.findByEmail("admin@portal.com").isEmpty()) {
            User admin = User.builder()
                    .email("admin@portal.com")
                    .passwordHash(passwordEncoder.encode("Admin@12345"))
                    .status(AccountStatus.ACTIVE)
                    .role(adminRole)
                    .deleted(false)
                    .build();
            userRepository.save(admin);
            log.info("Seeded Admin Account: admin@portal.com / Admin@12345");
        }

        if (userRepository.findByEmail("alex.intern@gmail.com").isEmpty()) {
            User alex = User.builder()
                    .email("alex.intern@gmail.com")
                    .passwordHash(passwordEncoder.encode("Admin@12345"))
                    .status(AccountStatus.ACTIVE)
                    .role(internRole)
                    .deleted(false)
                    .build();
            User savedAlex = userRepository.save(alex);

            InternProfile alexProfile = InternProfile.builder()
                    .user(savedAlex)
                    .employeeId("INT-2026-001")
                    .fullName("Alex Rivera")
                    .gender("Male")
                    .dob(LocalDate.of(2003, 5, 14))
                    .phone("+1-555-0192")
                    .address("123 Tech Avenue, Silicon Valley, CA")
                    .college("Stanford University")
                    .degree("B.S. Computer Science")
                    .department("Software Engineering")
                    .joiningDate(LocalDate.now().minusDays(30))
                    .expectedEndDate(LocalDate.now().plusDays(60))
                    .currentTechStack("Spring Boot, React, PostgreSQL, Java, TypeScript")
                    .primarySkill("Java")
                    .secondarySkill("React")
                    .githubUrl("https://github.com/alexrivera-dev")
                    .linkedinUrl("https://linkedin.com/in/alexrivera-dev")
                    .requiredDailyHours(8.0)
                    .build();
            internProfileRepository.save(alexProfile);

            // Sample attendance
            attendanceRepository.save(Attendance.builder()
                    .intern(savedAlex)
                    .attendanceDate(LocalDate.now().minusDays(2))
                    .loginTime(LocalDateTime.now().minusDays(2).minusHours(8))
                    .logoutTime(LocalDateTime.now().minusDays(2).minusHours(1))
                    .checkInTime(LocalDateTime.now().minusDays(2).minusHours(8))
                    .checkOutTime(LocalDateTime.now().minusDays(2).minusHours(1))
                    .workingHours("7h 0m")
                    .status(AttendanceStatus.PRESENT)
                    .build());

            attendanceRepository.save(Attendance.builder()
                    .intern(savedAlex)
                    .attendanceDate(LocalDate.now().minusDays(1))
                    .loginTime(LocalDateTime.now().minusDays(1).minusHours(8))
                    .logoutTime(LocalDateTime.now().minusDays(1).minusHours(4))
                    .checkInTime(LocalDateTime.now().minusDays(1).minusHours(8))
                    .checkOutTime(LocalDateTime.now().minusDays(1).minusHours(4))
                    .workingHours("4h 0m")
                    .status(AttendanceStatus.HALF_DAY)
                    .remarks("Doctor visit afternoon")
                    .build());

            attendanceRepository.save(Attendance.builder()
                    .intern(savedAlex)
                    .attendanceDate(LocalDate.now())
                    .loginTime(LocalDateTime.now().minusHours(4))
                    .checkInTime(LocalDateTime.now().minusHours(4))
                    .workingHours("In Progress")
                    .status(AttendanceStatus.PRESENT)
                    .remarks("Checked in today")
                    .build());

            // Sample assignments
            assignmentRepository.save(Assignment.builder()
                    .intern(savedAlex)
                    .title("Two Sum & LRU Cache")
                    .platform(Platform.LEETCODE)
                    .problemUrl("https://leetcode.com/problems/lru-cache/")
                    .techStack(TechStack.JAVA)
                    .difficulty(Difficulty.MEDIUM)
                    .timeTakenMinutes(45)
                    .status(AssignmentStatus.SOLVED)
                    .notes("Implemented doubly linked list with hashmap for O(1) ops")
                    .submissionDate(LocalDate.now().minusDays(2))
                    .deleted(false)
                    .build());

            assignmentRepository.save(Assignment.builder()
                    .intern(savedAlex)
                    .title("Window Functions & CTEs")
                    .platform(Platform.HACKERRANK)
                    .problemUrl("https://hackerrank.com/challenges/sql-window")
                    .techStack(TechStack.SQL)
                    .difficulty(Difficulty.HARD)
                    .timeTakenMinutes(60)
                    .status(AssignmentStatus.SOLVED)
                    .notes("Solved complex ranking partitions")
                    .submissionDate(LocalDate.now().minusDays(1))
                    .deleted(false)
                    .build());

            // Duolingo
            duolingoRepository.save(DuolingoUpdate.builder()
                    .intern(savedAlex)
                    .currentStreak(15)
                    .language("Spanish")
                    .xp(1450)
                    .dailyGoalCompleted(true)
                    .updateDate(LocalDate.now())
                    .build());

            // Tasks
            dailyTaskRepository.save(DailyTask.builder()
                    .intern(savedAlex)
                    .taskName("Implement Spring Security JWT Filter")
                    .description("Create token provider and stateless filter chain")
                    .category("Backend")
                    .assignedBy(AssignedBy.MANAGER)
                    .priority(TaskPriority.HIGH)
                    .estimatedHours(BigDecimal.valueOf(6.0))
                    .actualHours(BigDecimal.valueOf(5.5))
                    .progress(100)
                    .status(TaskStatus.COMPLETED)
                    .startDate(LocalDate.now().minusDays(3))
                    .completionDate(LocalDate.now().minusDays(1))
                    .deleted(false)
                    .build());

            dailyTaskRepository.save(DailyTask.builder()
                    .intern(savedAlex)
                    .taskName("Build React Recharts Dashboard")
                    .description("Integrate analytics API endpoints with UI charts")
                    .category("Frontend")
                    .assignedBy(AssignedBy.MANAGER)
                    .priority(TaskPriority.HIGH)
                    .estimatedHours(BigDecimal.valueOf(8.0))
                    .actualHours(BigDecimal.valueOf(3.0))
                    .progress(50)
                    .status(TaskStatus.IN_PROGRESS)
                    .startDate(LocalDate.now())
                    .deleted(false)
                    .build());

            log.info("Seeded Sample Active Intern: alex.intern@gmail.com / Admin@12345");
        }

        if (userRepository.findByEmail("maya.pending@gmail.com").isEmpty()) {
            User maya = User.builder()
                    .email("maya.pending@gmail.com")
                    .passwordHash(passwordEncoder.encode("Admin@12345"))
                    .status(AccountStatus.PENDING_APPROVAL)
                    .role(internRole)
                    .deleted(false)
                    .build();
            User savedMaya = userRepository.save(maya);

            InternProfile mayaProfile = InternProfile.builder()
                    .user(savedMaya)
                    .employeeId("INT-2026-002")
                    .fullName("Maya Lin")
                    .gender("Female")
                    .dob(LocalDate.of(2004, 1, 20))
                    .phone("+1-555-0283")
                    .address("456 Innovation Way, Boston, MA")
                    .college("MIT")
                    .degree("B.S. Data Science")
                    .department("Data Analytics")
                    .joiningDate(LocalDate.now().plusDays(5))
                    .expectedEndDate(LocalDate.now().plusDays(95))
                    .currentTechStack("Python, Spark, SQL, Data Engineering")
                    .primarySkill("Python")
                    .secondarySkill("Spark")
                    .githubUrl("https://github.com/mayalin-ds")
                    .linkedinUrl("https://linkedin.com/in/mayalin-ds")
                    .build();
            internProfileRepository.save(mayaProfile);

            log.info("Seeded Sample Pending Intern: maya.pending@gmail.com");
        }
    }
}
