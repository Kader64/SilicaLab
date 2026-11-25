namespace SilicaLab.Api.Data.Entities;

public enum AttemptStatus
{
    InProgress,
    Submitted,
    Expired
}

public class ExamAttempt
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid EnrollmentId { get; set; }
    public Guid ExamId { get; set; }

    public AttemptStatus Status { get; set; } = AttemptStatus.InProgress;
    public DateTimeOffset StartedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? ExpiresAt { get; set; }
    public DateTimeOffset? SubmittedAt { get; set; }

    public int ShuffleSeed { get; set; }
    public int PassMarkPercent { get; set; }
    public decimal? ScorePercent { get; set; }
    public bool? Passed { get; set; }

    // Navigation properties
    public Enrollment Enrollment { get; set; } = null!;
    public Exam Exam { get; set; } = null!;
    public Certificate? Certificate { get; set; }
    public ICollection<AttemptAnswer> AttemptAnswers { get; set; } = [];
}