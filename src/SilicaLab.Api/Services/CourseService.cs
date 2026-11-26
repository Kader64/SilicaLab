using ErrorOr;
using Microsoft.EntityFrameworkCore;
using SilicaLab.Api.Data;
using SilicaLab.Api.Data.Entities;
using SilicaLab.Api.Dtos.Courses;

namespace SilicaLab.Api.Services;

public interface ICourseService
{
    Task<ErrorOr<List<CategoryDto>>> GetCategoriesAsync();
    Task<ErrorOr<PagedResponse<CourseSummaryDto>>> GetPublishedCoursesAsync(CourseQueryParams query);
}

public class CourseService(AppDbContext dbContext) : ICourseService
{
    private const int MinPageSize = 1;
    private const int MaxPageSize = 50;

    public async Task<ErrorOr<List<CategoryDto>>> GetCategoriesAsync()
    {
        var categories = await dbContext.Categories
            .AsNoTracking()
            .OrderBy(c => c.Name)
            .Select(c => new CategoryDto(c.Id, c.Name))
            .ToListAsync();

        return categories;
    }

    public async Task<ErrorOr<PagedResponse<CourseSummaryDto>>> GetPublishedCoursesAsync(CourseQueryParams query)
    {
        var page = Math.Max(1, query.Page);
        var pageSize = Math.Clamp(query.PageSize, MinPageSize, MaxPageSize);

        // Only published courses
        var coursesQuery = dbContext.Courses
            .AsNoTracking()
            .Where(c => c.Status == CourseStatus.Published);

        if (!string.IsNullOrWhiteSpace(query.Category) &&
            !query.Category.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            var categoryName = query.Category.Trim();
            coursesQuery = coursesQuery.Where(c => c.Category.Name == categoryName);
        }

        if (query.Level.HasValue)
        {
            coursesQuery = coursesQuery.Where(c => c.Level == query.Level.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var pattern = $"%{EscapeLikePattern(query.Search.Trim())}%";
            coursesQuery = coursesQuery.Where(c =>
                EF.Functions.ILike(c.Title, pattern) ||
                EF.Functions.ILike(c.Description, pattern) ||
                EF.Functions.ILike(c.Teacher.FullName, pattern));
        }

        coursesQuery = query.Sort?.ToLowerInvariant() switch
        {
            "oldest" => coursesQuery.OrderBy(c => c.CreatedAt),
            "title" => coursesQuery.OrderBy(c => c.Title),
            _ => coursesQuery.OrderByDescending(c => c.PublishedAt ?? c.CreatedAt)
        };

        var totalCount = await coursesQuery.CountAsync();
        var totalPages = Math.Max(1, (int)Math.Ceiling(totalCount / (double)pageSize));
        var safePage = Math.Min(page, totalPages);

        var items = await coursesQuery
            .Skip((safePage - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new CourseSummaryDto(
                c.Id,
                c.Title,
                c.Description,
                c.Category.Name,
                c.Teacher.FullName,
                c.Level.ToString(),
                c.Status.ToString(),
                c.CoverType.ToString(),
                c.CoverGradient,
                c.CoverIcon,
                c.ThumbnailUrl,
                c.Lessons.Count,
                c.CreatedAt
            ))
            .ToListAsync();

        return new PagedResponse<CourseSummaryDto>(items, safePage, pageSize, totalCount, totalPages);
    }
    private static string EscapeLikePattern(string input) =>
        input.Replace("\\", "\\\\").Replace("%", "\\%").Replace("_", "\\_");
}