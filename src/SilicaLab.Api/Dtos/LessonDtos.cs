using System.ComponentModel.DataAnnotations;

namespace SilicaLab.Api.Dtos;

public record LessonDetailDto(
    Guid Id,
    Guid CourseId,
    string Title,
    int Order,
    string Content,
    string? VideoUrl,
    bool IsCompleted
);

public record CourseLessonsDto(
    Guid CourseId,
    string CourseTitle,
    int TotalLessons,
    int CompletedLessons,
    bool IsExamUnlocked,
    List<LessonDetailDto> Lessons
);

public record CreateLessonRequest(
    [Required, MaxLength(150)] string Title,
    [Required] string Content,
    [MaxLength(300)] string? VideoUrl
);

public record UpdateLessonRequest(
    [Required, MaxLength(150)] string Title,
    [Required] string Content,
    [MaxLength(300)] string? VideoUrl
);

public record ReorderLessonsRequest(
    [Required, MinLength(1)] List<Guid> LessonIds
);

public record LessonCompletionDto(
    Guid LessonId,
    bool IsCompleted,
    int CompletedLessons,
    int TotalLessons,
    bool IsExamUnlocked
);