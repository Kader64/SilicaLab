namespace SilicaLab.Api.Data.Entities;

public class Enrollment
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid StudentId { get; set; }
    public Guid CourseId { get; set; }
    public DateTimeOffset EnrolledAt { get; set; } = DateTimeOffset.UtcNow;

    // Navigation properties
    public AppUser Student { get; set; } = null!;
    public Course Course { get; set; } = null!;
    public ICollection<LessonProgress> LessonProgress { get; set; } = [];
    public ICollection<ExamAttempt> ExamAttempts { get; set; } = [];
}