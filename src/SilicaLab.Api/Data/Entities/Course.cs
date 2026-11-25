namespace SilicaLab.Api.Data.Entities;
public enum CoverType
{
    Gradient,
    Image
}

public enum CourseLevel
{
    Beginner,
    Intermediate,
    Advanced
}

public enum CourseStatus
{
    Draft,
    Published,
    Unpublished,
    Suspended
}

public class Course
{
    public Guid Id { get; set; }
    public Guid TeacherId { get; set; }
    public Guid CategoryId { get; set; }

    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public CoverType CoverType { get; set; } = CoverType.Gradient;
    public string CoverGradient { get; set; } = string.Empty;
    public string CoverIcon { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }

    public CourseLevel Level { get; set; } = CourseLevel.Beginner;
    public CourseStatus Status { get; set; } = CourseStatus.Draft;

    public DateTimeOffset? SuspendedAt { get; set; }
    public Guid? SuspendedByUserId { get; set; }
    public string? SuspensionReason { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public DateTimeOffset? PublishedAt { get; set; }

    // Navigation properties
    public AppUser Teacher { get; set; } = null!;
    public AppUser? SuspendedByUser { get; set; }
    public Category Category { get; set; } = null!;
    public Exam? Exam { get; set; }
    public ICollection<Lesson> Lessons { get; set; } = [];
}