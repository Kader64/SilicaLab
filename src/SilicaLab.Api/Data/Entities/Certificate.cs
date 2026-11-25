namespace SilicaLab.Api.Data.Entities;

public class Certificate
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public string Code { get; set; } = string.Empty;

    public Guid StudentId { get; set; }
    public Guid CourseId { get; set; }
    public Guid AttemptId { get; set; }

    public string StudentName { get; set; } = string.Empty;
    public string CourseTitle { get; set; } = string.Empty;
    public string TeacherName { get; set; } = string.Empty;
    public decimal ScorePercent { get; set; }

    public DateTimeOffset IssuedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? RevokedAt { get; set; }
    public Guid? RevokedByUserId { get; set; }
    public string? RevocationReason { get; set; }

    // Navigation properties
    public AppUser Student { get; set; } = null!;
    public Course Course { get; set; } = null!;
    public ExamAttempt Attempt { get; set; } = null!;
    public AppUser? RevokedByUser { get; set; }
}