namespace SilicaLab.Api.Dtos;

public record MyCertificateDto(
    Guid Id,
    string Code,
    Guid CourseId,
    string StudentName,
    string CourseTitle,
    string TeacherName,
    decimal ScorePercent,
    DateTimeOffset IssuedAt,
    bool IsRevoked,
    DateTimeOffset? RevokedAt,
    string? RevocationReason
);

public record CertificateVerificationDto(
    string Code,
    bool IsValid,
    string StudentName,
    string CourseTitle,
    string TeacherName,
    decimal ScorePercent,
    DateTimeOffset IssuedAt,
    bool IsRevoked,
    DateTimeOffset? RevokedAt,
    string? RevocationReason
);