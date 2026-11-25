namespace SilicaLab.Api.Data.Entities;

public class Exam
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid CourseId { get; set; }

    public int PassMarkPercent { get; set; } = 70;
    public int? TimeLimitMinutes { get; set; }
    public int? MaxAttempts { get; set; }

    // Navigation properties
    public Course Course { get; set; } = null!;
    public ICollection<Question> Questions { get; set; } = [];
}