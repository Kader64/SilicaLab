namespace SilicaLab.Api.Dtos;

public record EnrollResponseDto(
    Guid EnrollmentId,
    Guid CourseId,
    DateTimeOffset EnrolledAt
);

public record MyEnrollmentDto(
    Guid EnrollmentId,
    Guid CourseId,
    string Title,
    string Category,
    string Teacher,
    string Level,
    string CoverType,
    string CoverGradient,
    string CoverIcon,
    string? ThumbnailUrl,
    int TotalLessons,
    int CompletedLessons,
    bool IsExamUnlocked,
    bool HasPassedExam,
    string? CertificateCode,
    DateTimeOffset EnrolledAt
);