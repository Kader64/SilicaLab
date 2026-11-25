namespace SilicaLab.Api.Data.Entities;

public class LessonProgress
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid EnrollmentId { get; set; }
    public Guid LessonId { get; set; }
    public DateTimeOffset CompletedAt { get; set; } = DateTimeOffset.UtcNow;

    // Navigation properties
    public Enrollment Enrollment { get; set; } = null!;
    public Lesson Lesson { get; set; } = null!;
}