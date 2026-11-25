namespace SilicaLab.Api.Data.Entities;

public class AttemptAnswer
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid AttemptId { get; set; }
    public Guid QuestionId { get; set; }
    public Guid? SelectedAnswerId { get; set; }

    // Navigation properties
    public ExamAttempt Attempt { get; set; } = null!;
    public Question Question { get; set; } = null!;
    public Answer? SelectedAnswer { get; set; }
}