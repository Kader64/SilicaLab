namespace SilicaLab.Api.Data.Entities;

public class Question
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid ExamId { get; set; }

    public string Text { get; set; } = string.Empty;
    public int Order { get; set; }
    public bool IsArchived { get; set; } = false;

    // Navigation properties
    public Exam Exam { get; set; } = null!;
    public ICollection<Answer> Answers { get; set; } = [];
}