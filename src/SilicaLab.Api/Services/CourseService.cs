using ErrorOr;
using Microsoft.EntityFrameworkCore;
using SilicaLab.Api.Data;
using SilicaLab.Api.Data.Entities;
using SilicaLab.Api.Dtos;

namespace SilicaLab.Api.Services;

public interface ICourseService
{
    Task<ErrorOr<List<CategoryDto>>> GetCategoriesAsync();
    Task<ErrorOr<PagedResponse<CourseSummaryDto>>> GetPublishedCoursesAsync(CourseQueryParams query);
    Task<ErrorOr<CourseDetailDto>> GetCourseByIdAsync(Guid courseId, Guid? currentUserId, bool isAdmin);
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

    public async Task<ErrorOr<CourseDetailDto>> GetCourseByIdAsync(
            Guid courseId,
            Guid? currentUserId,
            bool isAdmin)
    {
        var course = await dbContext.Courses
            .AsNoTracking()
            .Where(c => c.Id == courseId)
            .Select(c => new
            {
                c.Id,
                c.Title,
                c.Description,
                c.CategoryId,
                Category = c.Category.Name,
                c.TeacherId,
                Teacher = c.Teacher.FullName,
                c.Level,
                c.Status,
                c.SuspensionReason,
                c.CoverType,
                c.CoverGradient,
                c.CoverIcon,
                c.ThumbnailUrl,
                c.CreatedAt,
                c.UpdatedAt,
                c.PublishedAt,
                EnrolledStudentsCount = dbContext.Enrollments.Count(e => e.CourseId == c.Id),
                Lessons = c.Lessons
                    .OrderBy(l => l.Order)
                    .Select(l => new LessonOverviewDto(
                        l.Id,
                        l.Title,
                        l.Order,
                        !string.IsNullOrEmpty(l.VideoUrl)
                    ))
                    .ToList(),
                Exam = c.Exam == null
                    ? null
                    : new ExamOverviewDto(
                        c.Exam.Id,
                        c.Exam.PassMarkPercent,
                        c.Exam.TimeLimitMinutes,
                        c.Exam.MaxAttempts,
                        c.Exam.Questions.Count(q => !q.IsArchived)
                    )
            })
            .FirstOrDefaultAsync();

        if (course is null)
            return Error.NotFound("Course.NotFound", "Course was not found.");

        var isOwner = currentUserId.HasValue && course.TeacherId == currentUserId.Value;
        if (course.Status != CourseStatus.Published && !isOwner && !isAdmin)
            return Error.NotFound("Course.NotFound", "Course was not found.");

        StudentCourseProgressDto? studentProgress = null;

        if (currentUserId.HasValue && !isOwner)
        {
            var enrollment = await dbContext.Enrollments
                .AsNoTracking()
                .Where(e => e.CourseId == courseId && e.StudentId == currentUserId.Value)
                .Select(e => new
                {
                    e.Id,
                    e.EnrolledAt,
                    CompletedCount = e.LessonProgress.Count,
                    HasPassedExam = e.ExamAttempts.Any(a => a.Passed == true),
                    CertificateCode = dbContext.Certificates
                        .Where(cert =>
                            cert.StudentId == currentUserId.Value &&
                            cert.CourseId == courseId &&
                            cert.RevokedAt == null)
                        .Select(cert => cert.Code)
                        .FirstOrDefault()
                })
                .FirstOrDefaultAsync();

            if (enrollment is not null)
            {
                var totalLessons = course.Lessons.Count;
                var isExamUnlocked = totalLessons > 0 && enrollment.CompletedCount >= totalLessons;

                studentProgress = new StudentCourseProgressDto(
                    enrollment.Id,
                    enrollment.EnrolledAt,
                    enrollment.CompletedCount,
                    isExamUnlocked,
                    enrollment.HasPassedExam,
                    enrollment.CertificateCode
                );
            }
        }

        // Only expose SuspensionReason to the owning Teacher or Admin
        var visibleSuspensionReason = (isOwner || isAdmin) ? course.SuspensionReason : null;

        return new CourseDetailDto(
            course.Id,
            course.Title,
            course.Description,
            course.CategoryId,
            course.Category,
            course.TeacherId,
            course.Teacher,
            course.Level.ToString(),
            course.Status.ToString(),
            visibleSuspensionReason,
            course.CoverType.ToString(),
            course.CoverGradient,
            course.CoverIcon,
            course.ThumbnailUrl,
            course.CreatedAt,
            course.UpdatedAt,
            course.PublishedAt,
            course.EnrolledStudentsCount,
            course.Lessons,
            course.Exam,
            studentProgress
        );
    }
}