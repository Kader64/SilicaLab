using System.ComponentModel.DataAnnotations;
using SilicaLab.Api.Data.Entities;

namespace SilicaLab.Api.Dtos.Courses;

public record CategoryDto(Guid Id, string Name);

public record CourseSummaryDto(
    Guid Id,
    string Title,
    string Description,
    string Category,
    string Teacher,
    string Level,
    string Status,
    string CoverType,
    string CoverGradient,
    string CoverIcon,
    string? ThumbnailUrl,
    int Lessons,
    DateTimeOffset CreatedAt
);

public record PagedResponse<T>(
    List<T> Items,
    int Page,
    int PageSize,
    int TotalCount,
    int TotalPages
);

public record CourseQueryParams(
    [MaxLength(100)] string? Search = null,
    [MaxLength(60)] string? Category = null,
    CourseLevel? Level = null,
    [MaxLength(20)] string? Sort = "newest",
    int Page = 1,
    int PageSize = 9
);