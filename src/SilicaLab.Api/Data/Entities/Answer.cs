namespace SilicaLab.Api.Data.Entities;

public class Answer
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid QuestionId { get; set; }

    public string Text { get; set; } = string.Empty;
    public bool IsCorrect { get; set; } = false;
    public int Order { get; set; }
    public bool IsArchived { get; set; } = false;

    // Navigation properties
    public Question Question { get; set; } = null!;
}