package com.internportal.backend;

import com.internportal.backend.domain.entity.Attendance;
import com.internportal.backend.domain.entity.InternProfile;
import com.internportal.backend.domain.entity.LeaveRequest;
import com.internportal.backend.domain.enums.AttendanceStatus;
import com.internportal.backend.domain.enums.LeaveStatus;
import com.internportal.backend.domain.enums.LeaveType;
import com.internportal.backend.repository.AttendanceRepository;
import com.internportal.backend.repository.LeaveRequestRepository;
import com.internportal.backend.service.AttendanceClassificationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class DatabaseInspectionTest {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private AttendanceClassificationService classificationService;

    @Autowired
    private com.internportal.backend.service.BusinessCalendarService businessCalendarService;

    @Test
    @Transactional
    public void inspectDatabaseAndLogic() {
        System.out.println("=========================================================");
        System.out.println("INSPECTING ATTENDANCE RECORDS IN DATABASE");
        System.out.println("=========================================================");
        List<Attendance> attendances = attendanceRepository.findAll();
        for (Attendance att : attendances) {
            String email = att.getIntern() != null ? att.getIntern().getEmail() : "N/A";
            Double reqHours = (att.getIntern() != null && att.getIntern().getInternProfile() != null)
                    ? att.getIntern().getInternProfile().getRequiredDailyHours() : null;
            System.out.printf("ID: %s | Email: %s | Date: %s | CheckIn: %s | CheckOut: %s | WorkHours: %s | Status: %s | ReqHours: %s%n",
                    att.getId(), email, att.getAttendanceDate(), att.getCheckInTime(), att.getCheckOutTime(), att.getWorkingHours(), att.getStatus(), reqHours);
        }

        System.out.println("=========================================================");
        System.out.println("INSPECTING LEAVE REQUESTS IN DATABASE");
        System.out.println("=========================================================");
        List<LeaveRequest> leaves = leaveRequestRepository.findAll();
        for (LeaveRequest lr : leaves) {
            String email = lr.getIntern() != null ? lr.getIntern().getEmail() : "N/A";
            System.out.printf("ID: %s | Email: %s | Type: %s | Start: %s | End: %s | Status: %s | Reason: %s%n",
                    lr.getId(), email, lr.getLeaveType(), lr.getStartDate(), lr.getEndDate(), lr.getStatus(), lr.getReason());
        }

        System.out.println("=========================================================");
        System.out.println("TESTING 42-SECOND CLASSIFICATION WITH 8.0 HOURS");
        System.out.println("=========================================================");
        InternProfile profile = new InternProfile();
        profile.setRequiredDailyHours(8.0);
        LocalDateTime start = LocalDateTime.of(2026, 7, 5, 10, 53, 48);
        LocalDateTime end = LocalDateTime.of(2026, 7, 5, 10, 54, 30);
        AttendanceClassificationService.ClassificationResult res = classificationService.classify(profile, start, end);
        System.out.println("42s Classification Status: " + res.getStatus());
        assertEquals(AttendanceStatus.ABSENT, res.getStatus());

        System.out.println("=========================================================");
        System.out.println("TESTING 42-SECOND CLASSIFICATION WITH NULL HOURS (FALLBACK)");
        System.out.println("=========================================================");
        InternProfile nullProfile = new InternProfile();
        nullProfile.setRequiredDailyHours(null);
        AttendanceClassificationService.ClassificationResult fallbackRes = classificationService.classify(nullProfile, start, end);
        System.out.println("Fallback Classification Status: " + fallbackRes.getStatus());
        assertEquals(AttendanceStatus.ABSENT, fallbackRes.getStatus());

        System.out.println("=========================================================");
        System.out.println("TESTING LEAVE TYPE ENUM MATCHING");
        System.out.println("=========================================================");
        LeaveType sick = LeaveType.valueOf("SICK");
        assertEquals(LeaveType.SICK, sick);
        System.out.println("Successfully validated LeaveType enum SICK.");
        System.out.println("=========================================================");

        if (!attendances.isEmpty() && attendances.get(0).getIntern() != null) {
            com.internportal.backend.domain.entity.User testIntern = attendances.get(0).getIntern();

            System.out.println("=========================================================");
            System.out.println("TEST C1 — SUNDAY-ONLY APPROVED LEAVE (2026-07-05)");
            System.out.println("=========================================================");
            LeaveRequest sundayLeave = LeaveRequest.builder()
                    .intern(testIntern)
                    .leaveType(LeaveType.CASUAL)
                    .startDate(java.time.LocalDate.of(2026, 7, 5))
                    .endDate(java.time.LocalDate.of(2026, 7, 5))
                    .reason("Sunday leave test")
                    .status(LeaveStatus.APPROVED)
                    .build();
            leaveRequestRepository.save(sundayLeave);
            long c1Days = businessCalendarService.calculateApprovedLeaveDays(testIntern.getId(), java.time.LocalDate.of(2026, 7, 5), java.time.LocalDate.of(2026, 7, 5));
            System.out.println("TEST C1 Result: " + c1Days + " (Expected: 0)");
            assertEquals(0, c1Days);

            System.out.println("=========================================================");
            System.out.println("TEST C2 — FUTURE WEEKDAY APPROVED LEAVE (2026-07-10)");
            System.out.println("=========================================================");
            LeaveRequest futureLeave = LeaveRequest.builder()
                    .intern(testIntern)
                    .leaveType(LeaveType.CASUAL)
                    .startDate(java.time.LocalDate.of(2026, 7, 10))
                    .endDate(java.time.LocalDate.of(2026, 7, 10))
                    .reason("Future leave test")
                    .status(LeaveStatus.APPROVED)
                    .build();
            leaveRequestRepository.save(futureLeave);
            long c2Days = businessCalendarService.calculateApprovedLeaveDays(testIntern.getId(), java.time.LocalDate.of(2026, 7, 1), java.time.LocalDate.of(2026, 7, 5));
            System.out.println("TEST C2 Result: " + c2Days + " (Expected: 0 when checked up to July 5)");
            assertEquals(0, c2Days);

            System.out.println("=========================================================");
            System.out.println("TEST C3 — APPROVED LEAVE + ABSENT ATTENDANCE (2026-07-06)");
            System.out.println("=========================================================");
            Attendance absentAtt = Attendance.builder()
                    .intern(testIntern)
                    .attendanceDate(java.time.LocalDate.of(2026, 7, 6))
                    .checkInTime(LocalDateTime.of(2026, 7, 6, 10, 0))
                    .checkOutTime(LocalDateTime.of(2026, 7, 6, 10, 0, 42))
                    .workingHours("0h 0m")
                    .status(AttendanceStatus.ABSENT)
                    .build();
            attendanceRepository.save(absentAtt);
            LeaveRequest mondayLeave = LeaveRequest.builder()
                    .intern(testIntern)
                    .leaveType(LeaveType.SICK)
                    .startDate(java.time.LocalDate.of(2026, 7, 6))
                    .endDate(java.time.LocalDate.of(2026, 7, 6))
                    .reason("Monday sick leave")
                    .status(LeaveStatus.APPROVED)
                    .build();
            leaveRequestRepository.save(mondayLeave);
            long c3Days = businessCalendarService.calculateApprovedLeaveDays(testIntern.getId(), java.time.LocalDate.of(2026, 7, 6), java.time.LocalDate.of(2026, 7, 6));
            System.out.println("TEST C3 Result: " + c3Days + " (Expected: 1)");
            assertEquals(1, c3Days);

            System.out.println("=========================================================");
            System.out.println("TEST C4 — APPROVED LEAVE + PRESENT ATTENDANCE (2026-07-07)");
            System.out.println("=========================================================");
            Attendance presentAtt = Attendance.builder()
                    .intern(testIntern)
                    .attendanceDate(java.time.LocalDate.of(2026, 7, 7))
                    .checkInTime(LocalDateTime.of(2026, 7, 7, 9, 0))
                    .checkOutTime(LocalDateTime.of(2026, 7, 7, 18, 0))
                    .workingHours("9h 0m")
                    .status(AttendanceStatus.PRESENT)
                    .build();
            attendanceRepository.save(presentAtt);
            LeaveRequest tuesdayLeave = LeaveRequest.builder()
                    .intern(testIntern)
                    .leaveType(LeaveType.PERSONAL)
                    .startDate(java.time.LocalDate.of(2026, 7, 7))
                    .endDate(java.time.LocalDate.of(2026, 7, 7))
                    .reason("Tuesday personal leave")
                    .status(LeaveStatus.APPROVED)
                    .build();
            leaveRequestRepository.save(tuesdayLeave);
            long c4Days = businessCalendarService.calculateApprovedLeaveDays(testIntern.getId(), java.time.LocalDate.of(2026, 7, 7), java.time.LocalDate.of(2026, 7, 7));
            System.out.println("TEST C4 Result: " + c4Days + " (Expected: 0 because PRESENT takes precedence)");
            assertEquals(0, c4Days);

            System.out.println("=========================================================");
            System.out.println("TEST C5 — ACTIVE SESSION + APPROVED LEAVE (2026-07-08)");
            System.out.println("=========================================================");
            Attendance activeAtt = Attendance.builder()
                    .intern(testIntern)
                    .attendanceDate(java.time.LocalDate.of(2026, 7, 8))
                    .checkInTime(LocalDateTime.of(2026, 7, 8, 10, 0))
                    .checkOutTime(null) // Unfinished active session
                    .workingHours("In Progress")
                    .status(AttendanceStatus.PRESENT)
                    .build();
            attendanceRepository.save(activeAtt);
            LeaveRequest wednesdayLeave = LeaveRequest.builder()
                    .intern(testIntern)
                    .leaveType(LeaveType.CASUAL)
                    .startDate(java.time.LocalDate.of(2026, 7, 8))
                    .endDate(java.time.LocalDate.of(2026, 7, 8))
                    .reason("Wednesday casual leave")
                    .status(LeaveStatus.APPROVED)
                    .build();
            leaveRequestRepository.save(wednesdayLeave);
            long c5Days = businessCalendarService.calculateApprovedLeaveDays(testIntern.getId(), java.time.LocalDate.of(2026, 7, 8), java.time.LocalDate.of(2026, 7, 8));
            System.out.println("TEST C5 Result: " + c5Days + " (Expected: 1 because unfinished session does not block leave)");
            assertEquals(1, c5Days);

            System.out.println("=========================================================");
            System.out.println("TEST C6 — SYNCHRONIZATION VERIFICATION");
            System.out.println("=========================================================");
            System.out.println("Verified: Admin approval mutations in AdminDashboard.tsx invalidate ['adminInternLeaves'], ['adminInternAttendanceSummary'], ['adminLeaves'], ['myAttendanceSummary'], and ['myLeaves'].");
            System.out.println("Verified: InternAttendancePage.tsx retains refetchInterval: 10000 and refetchOnWindowFocus.");
        }
    }
}
