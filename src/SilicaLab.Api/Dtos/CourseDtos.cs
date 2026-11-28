using System.ComponentModel.DataAnnotations;
using SilicaLab.Api.Data.Entities;

namespace SilicaLab.Api.Dtos;

public record CategoryDto(Guid Id, string Name);

public record CourseSummaryDto(
    Guid Id,
    string Title,
    string Description,
    string Category,
    string Teacher,
    string Level,
    string Status,
    string CoverType,
    string CoverGradient,
    string CoverIcon,
    string? ThumbnailUrl,
    int Lessons,
    DateTimeOffset CreatedAt
);

public record PagedResponse<T>(
    List<T> Items,
    int Page,
    int PageSize,
    int TotalCount,
    int TotalPages
);

public record CourseQueryParams(
    [MaxLength(100)] string? Search = null,
    [MaxLength(60)] string? Category = null,
    CourseLevel? Level = null,
    [MaxLength(20)] string? Sort = "newest",
    int Page = 1,
    int PageSize = 9
);

public record LessonOverviewDto(
    Guid Id,
    string Title,
    int Order,
    bool HasVideo
);

public record ExamOverviewDto(
    Guid Id,
    int PassMarkPercent,
    int? TimeLimitMinutes,
    int? MaxAttempts,
    int QuestionCount
);

public record StudentCourseProgressDto(
    Guid EnrollmentId,
    DateTimeOffset EnrolledAt,
    int CompletedLessonsCount,
    bool IsExamUnlocked,
    bool HasPassedExam,
    string? CertificateCode
);

public record CourseDetailDto(
    Guid Id,
    string Title,
    string Description,
    Guid CategoryId,
    string Category,
    Guid TeacherId,
    string Teacher,
    string Level,
    string Status,
    string? SuspensionReason,
    string CoverType,
    string CoverGradient,
    string CoverIcon,
    string? ThumbnailUrl,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    DateTimeOffset? PublishedAt,
    int EnrolledStudentsCount,
    List<LessonOverviewDto> Lessons,
    ExamOverviewDto? Exam,
    StudentCourseProgressDto? StudentProgress
);
