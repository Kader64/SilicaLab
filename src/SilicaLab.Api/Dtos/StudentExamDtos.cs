using System.ComponentModel.DataAnnotations;

namespace SilicaLab.Api.Dtos;

public record ExamAttemptSummaryDto(
    Guid AttemptId,
    string Status,
    DateTimeOffset StartedAt,
    DateTimeOffset? ExpiresAt,
    DateTimeOffset? SubmittedAt,
    int PassMarkPercent,
    decimal? ScorePercent,
    bool? Passed,
    string? CertificateCode
);

public record StudentExamOverviewDto(
    Guid ExamId,
    Guid CourseId,
    string CourseTitle,
    int PassMarkPercent,
    int? TimeLimitMinutes,
    int? MaxAttempts,
    int ActiveQuestionsCount,
    bool IsUnlocked,
    int CompletedLessons,
    int TotalLessons,
    int AttemptsUsed,
    int? RemainingAttempts,
    bool CanStartNewAttempt,
    Guid? ActiveAttemptId,
    bool HasPassed,
    string? CertificateCode,
    List<ExamAttemptSummaryDto> Attempts
);

public record ExamAnswerOptionDto(
    Guid AnswerId,
    string Text
);

public record ExamQuestionDto(
    Guid QuestionId,
    string Text,
    Guid? SelectedAnswerId,
    List<ExamAnswerOptionDto> Answers
);

public record ActiveExamAttemptDto(
    Guid AttemptId,
    Guid ExamId,
    Guid CourseId,
    string CourseTitle,
    string Status,
    DateTimeOffset StartedAt,
    DateTimeOffset? ExpiresAt,
    int PassMarkPercent,
    List<ExamQuestionDto> Questions
);

public record SaveAttemptAnswerRequest(
    [Required] Guid QuestionId,
    Guid? SelectedAnswerId
);

public record ExamAttemptResultDto(
    Guid AttemptId,
    Guid CourseId,
    string Status,
    DateTimeOffset StartedAt,
    DateTimeOffset? SubmittedAt,
    int PassMarkPercent,
    int CorrectAnswers,
    int TotalQuestions,
    decimal ScorePercent,
    bool Passed,
    string? CertificateCode
);