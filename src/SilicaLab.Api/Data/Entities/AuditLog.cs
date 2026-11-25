namespace SilicaLab.Api.Data.Entities;

public enum AuditAction
{
    UserDisabled,
    UserEnabled,
    UserRoleChanged,
    CourseSuspended,
    CourseRestored,
    CertificateRevoked,
    CertificateRestored,
    CategoryCreated
}

public enum AuditTargetType
{
    User,
    Course,
    Certificate,
    Category
}

public class AuditLog
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid ActorUserId { get; set; }

    public AuditAction Action { get; set; }
    public AuditTargetType TargetType { get; set; }
    public Guid TargetId { get; set; }

    public string? Details { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    // Navigation properties
    public AppUser ActorUser { get; set; } = null!;
}