package com.internportal.backend.mapper;

import com.internportal.backend.domain.entity.*;
import com.internportal.backend.dto.response.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface EntityMapper {

    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "id", target = "profileId")
    @Mapping(source = "user.email", target = "email")
    @Mapping(source = "user.status", target = "status")
    InternProfileResponse toInternProfileResponse(InternProfile profile);

    @Mapping(source = "intern.id", target = "internId")
    @Mapping(source = "intern.internProfile.fullName", target = "internName")
    AttendanceResponse toAttendanceResponse(Attendance attendance);

    @Mapping(source = "intern.id", target = "internId")
    @Mapping(source = "intern.internProfile.fullName", target = "internName")
    @Mapping(expression = "java(mapScreenshotUrls(assignment.getScreenshots()))", target = "screenshotUrls")
    AssignmentResponse toAssignmentResponse(Assignment assignment);

    default List<String> mapScreenshotUrls(List<AssignmentScreenshot> screenshots) {
        if (screenshots == null) return List.of();
        return screenshots.stream()
                .map(AssignmentScreenshot::getFilePath)
                .collect(Collectors.toList());
    }

    @Mapping(source = "intern.id", target = "internId")
    @Mapping(source = "intern.internProfile.fullName", target = "internName")
    DuolingoResponse toDuolingoResponse(DuolingoUpdate update);

    @Mapping(source = "intern.id", target = "internId")
    @Mapping(source = "intern.internProfile.fullName", target = "internName")
    TaskResponse toTaskResponse(DailyTask task);

    @Mapping(source = "intern.id", target = "internId")
    @Mapping(source = "intern.internProfile.fullName", target = "internName")
    @Mapping(source = "intern.email", target = "internEmail")
    @Mapping(source = "reviewedBy.internProfile.fullName", target = "reviewedByName")
    LeaveRequestResponse toLeaveRequestResponse(LeaveRequest leaveRequest);

    @org.mapstruct.AfterMapping
    default void enrichAttendance(Attendance attendance, @org.mapstruct.MappingTarget AttendanceResponse response) {
        if (response.getCheckInTime() == null && attendance.getLoginTime() != null) {
            response.setCheckInTime(attendance.getLoginTime());
        }
        if (response.getCheckOutTime() == null && attendance.getLogoutTime() != null) {
            response.setCheckOutTime(attendance.getLogoutTime());
        }
        if (response.getWorkingHours() == null) {
            if (response.getCheckOutTime() != null && response.getCheckInTime() != null) {
                java.time.Duration dur = java.time.Duration.between(response.getCheckInTime(), response.getCheckOutTime());
                long h = dur.toHours();
                long m = dur.toMinutesPart();
                response.setWorkingHours(h + "h " + m + "m");
            } else {
                response.setWorkingHours("In Progress");
            }
        }
    }

    @org.mapstruct.AfterMapping
    default void enrichLeaveRequest(LeaveRequest request, @org.mapstruct.MappingTarget LeaveRequestResponse response) {
        if (request.getReviewedBy() != null && response.getReviewedByName() == null) {
            response.setReviewedByName(request.getReviewedBy().getEmail());
        }
        if (request.getStartDate() != null && request.getEndDate() != null) {
            long days = 0;
            java.time.LocalDate curr = request.getStartDate();
            while (!curr.isAfter(request.getEndDate())) {
                java.time.DayOfWeek dow = curr.getDayOfWeek();
                if (dow != java.time.DayOfWeek.SATURDAY && dow != java.time.DayOfWeek.SUNDAY) {
                    days++;
                }
                curr = curr.plusDays(1);
            }
            response.setWorkingLeaveDays(days);
        }
    }
}
