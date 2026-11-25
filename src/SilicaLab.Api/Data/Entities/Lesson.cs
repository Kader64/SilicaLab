namespace SilicaLab.Api.Data.Entities;


public class Lesson
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid CourseId { get; set; }

    public string Title { get; set; } = string.Empty;
    public int Order { get; set; }
    public string Content { get; set; } = string.Empty;
    public string? VideoUrl { get; set; }

    // Navigation properties
    public Course Course { get; set; } = null!;
}
