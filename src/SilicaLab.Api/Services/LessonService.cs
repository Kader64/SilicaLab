using ErrorOr;
using Microsoft.EntityFrameworkCore;
using SilicaLab.Api.Data;
using SilicaLab.Api.Data.Entities;
using SilicaLab.Api.Dtos;

namespace SilicaLab.Api.Services;

public interface ILessonService
{
    Task<ErrorOr<CourseLessonsDto>> GetCourseLessonsAsync(Guid courseId, Guid userId, bool isAdmin);
    Task<ErrorOr<LessonDetailDto>> GetLessonByIdAsync(Guid courseId, Guid lessonId, Guid userId, bool isAdmin);
    Task<ErrorOr<LessonDetailDto>> CreateLessonAsync(Guid courseId, Guid teacherId, bool isAdmin, CreateLessonRequest request);
    Task<ErrorOr<LessonDetailDto>> UpdateLessonAsync(Guid courseId, Guid lessonId, Guid teacherId, bool isAdmin, UpdateLessonRequest request);
    Task<ErrorOr<Deleted>> DeleteLessonAsync(Guid courseId, Guid lessonId, Guid teacherId, bool isAdmin);
    Task<ErrorOr<List<LessonDetailDto>>> ReorderLessonsAsync(Guid courseId, Guid teacherId, bool isAdmin, ReorderLessonsRequest request);
    Task<ErrorOr<LessonCompletionDto>> ToggleLessonCompletionAsync(Guid courseId, Guid lessonId, Guid studentId, bool completed);
}

public class LessonService(AppDbContext dbContext) : ILessonService
{
    private static readonly HashSet<string> AllowedVideoHosts = new(StringComparer.OrdinalIgnoreCase)
    {
        "youtube.com",
        "www.youtube.com",
        "youtu.be",
        "vimeo.com",
        "player.vimeo.com"
    };

    public async Task<ErrorOr<CourseLessonsDto>> GetCourseLessonsAsync(Guid courseId, Guid userId, bool isAdmin)
    {
        var course = await dbContext.Courses
            .AsNoTracking()
            .Where(c => c.Id == courseId)
            .Select(c => new
            {
                c.Id,
                c.Title,
                c.TeacherId,
                c.Status
            })
            .FirstOrDefaultAsync();

        if (course is null)
            return Error.NotFound("Course.NotFound", "Course was not found.");

        var isOwnerOrAdmin = isAdmin || course.TeacherId == userId;

        Guid? enrollmentId = null;
        if (!isOwnerOrAdmin)
        {
            if (course.Status != CourseStatus.Published)
                return Error.NotFound("Course.NotFound", "Course was not found.");

            enrollmentId = await dbContext.Enrollments
                .AsNoTracking()
                .Where(e => e.CourseId == courseId && e.StudentId == userId)
                .Select(e => (Guid?)e.Id)
                .FirstOrDefaultAsync();

            if (enrollmentId is null)
                return Error.Forbidden("Lesson.NotEnrolled", "You must enroll in this course to access its lessons.");
        }

        var completedLessonIds = enrollmentId.HasValue
            ? await dbContext.LessonProgress
                .AsNoTracking()
                .Where(lp => lp.EnrollmentId == enrollmentId.Value)
                .Select(lp => lp.LessonId)
                .ToHashSetAsync()
            : [];

        var lessons = await dbContext.Lessons
            .AsNoTracking()
            .Where(l => l.CourseId == courseId)
            .OrderBy(l => l.Order)
            .Select(l => new LessonDetailDto(
                l.Id,
                l.CourseId,
                l.Title,
                l.Order,
                l.Content,
                l.VideoUrl,
                completedLessonIds.Contains(l.Id)
            ))
            .ToListAsync();

        var totalLessons = lessons.Count;
        var completedCount = lessons.Count(l => l.IsCompleted);
        var isExamUnlocked = totalLessons > 0 && completedCount == totalLessons;

        return new CourseLessonsDto(
            course.Id,
            course.Title,
            totalLessons,
            completedCount,
            isExamUnlocked,
            lessons
        );
    }

    public async Task<ErrorOr<LessonDetailDto>> GetLessonByIdAsync(Guid courseId, Guid lessonId, Guid userId, bool isAdmin)
    {
        var course = await dbContext.Courses
            .AsNoTracking()
            .Where(c => c.Id == courseId)
            .Select(c => new { c.Id, c.TeacherId, c.Status })
            .FirstOrDefaultAsync();

        if (course is null)
            return Error.NotFound("Course.NotFound", "Course was not found.");

        var isOwnerOrAdmin = isAdmin || course.TeacherId == userId;

        Guid? enrollmentId = null;
        if (!isOwnerOrAdmin)
        {
            if (course.Status != CourseStatus.Published)
                return Error.NotFound("Course.NotFound", "Course was not found.");

            enrollmentId = await dbContext.Enrollments
                .AsNoTracking()
                .Where(e => e.CourseId == courseId && e.StudentId == userId)
                .Select(e => (Guid?)e.Id)
                .FirstOrDefaultAsync();

            if (enrollmentId is null)
                return Error.Forbidden("Lesson.NotEnrolled", "You must enroll in this course to view this lesson.");
        }

        var lesson = await dbContext.Lessons
            .AsNoTracking()
            .FirstOrDefaultAsync(l => l.Id == lessonId && l.CourseId == courseId);

        if (lesson is null)
            return Error.NotFound("Lesson.NotFound", "Lesson was not found.");

        var isCompleted = enrollmentId.HasValue && await dbContext.LessonProgress
            .AsNoTracking()
            .AnyAsync(lp => lp.EnrollmentId == enrollmentId.Value && lp.LessonId == lessonId);

        return new LessonDetailDto(
            lesson.Id,
            lesson.CourseId,
            lesson.Title,
            lesson.Order,
            lesson.Content,
            lesson.VideoUrl,
            isCompleted
        );
    }

    public async Task<ErrorOr<LessonDetailDto>> CreateLessonAsync(
        Guid courseId,
        Guid teacherId,
        bool isAdmin,
        CreateLessonRequest request)
    {
        var course = await dbContext.Courses.FirstOrDefaultAsync(c => c.Id == courseId);
        if (course is null)
            return Error.NotFound("Course.NotFound", "Course was not found.");

        if (!isAdmin && course.TeacherId != teacherId)
            return Error.Forbidden("Course.Forbidden", "You do not have permission to modify this course.");

        if (course.Status == CourseStatus.Suspended && !isAdmin)
            return Error.Validation("Course.Suspended", "Suspended courses cannot be modified.");

        var videoValidation = ValidateVideoUrl(request.VideoUrl);
        if (videoValidation.IsError)
            return videoValidation.Errors;

        var maxOrder = await dbContext.Lessons
            .Where(l => l.CourseId == courseId)
            .Select(l => (int?)l.Order)
            .MaxAsync() ?? 0;

        var lesson = new Lesson
        {
            Id = Guid.CreateVersion7(),
            CourseId = courseId,
            Title = request.Title.Trim(),
            Order = maxOrder + 1,
            Content = request.Content.Trim(),
            VideoUrl = string.IsNullOrWhiteSpace(request.VideoUrl) ? null : request.VideoUrl.Trim()
        };

        course.UpdatedAt = DateTimeOffset.UtcNow;
        dbContext.Lessons.Add(lesson);
        await dbContext.SaveChangesAsync();

        return new LessonDetailDto(
            lesson.Id,
            lesson.CourseId,
            lesson.Title,
            lesson.Order,
            lesson.Content,
            lesson.VideoUrl,
            IsCompleted: false
        );
    }

    public async Task<ErrorOr<LessonDetailDto>> UpdateLessonAsync(
        Guid courseId,
        Guid lessonId,
        Guid teacherId,
        bool isAdmin,
        UpdateLessonRequest request)
    {
        var course = await dbContext.Courses.FirstOrDefaultAsync(c => c.Id == courseId);
        if (course is null)
            return Error.NotFound("Course.NotFound", "Course was not found.");

        if (!isAdmin && course.TeacherId != teacherId)
            return Error.Forbidden("Course.Forbidden", "You do not have permission to modify this course.");

        if (course.Status == CourseStatus.Suspended && !isAdmin)
            return Error.Validation("Course.Suspended", "Suspended courses cannot be modified.");

        var videoValidation = ValidateVideoUrl(request.VideoUrl);
        if (videoValidation.IsError)
            return videoValidation.Errors;

        var lesson = await dbContext.Lessons
            .FirstOrDefaultAsync(l => l.Id == lessonId && l.CourseId == courseId);

        if (lesson is null)
            return Error.NotFound("Lesson.NotFound", "Lesson was not found.");

        lesson.Title = request.Title.Trim();
        lesson.Content = request.Content.Trim();
        lesson.VideoUrl = string.IsNullOrWhiteSpace(request.VideoUrl) ? null : request.VideoUrl.Trim();
        course.UpdatedAt = DateTimeOffset.UtcNow;

        await dbContext.SaveChangesAsync();

        return new LessonDetailDto(
            lesson.Id,
            lesson.CourseId,
            lesson.Title,
            lesson.Order,
            lesson.Content,
            lesson.VideoUrl,
            IsCompleted: false
        );
    }

    public async Task<ErrorOr<Deleted>> DeleteLessonAsync(
        Guid courseId,
        Guid lessonId,
        Guid teacherId,
        bool isAdmin)
    {
        var course = await dbContext.Courses.FirstOrDefaultAsync(c => c.Id == courseId);
        if (course is null)
            return Error.NotFound("Course.NotFound", "Course was not found.");

        if (!isAdmin && course.TeacherId != teacherId)
            return Error.Forbidden("Course.Forbidden", "You do not have permission to modify this course.");

        if (course.Status == CourseStatus.Suspended && !isAdmin)
            return Error.Validation("Course.Suspended", "Suspended courses cannot be modified.");

        var lessons = await dbContext.Lessons
            .Where(l => l.CourseId == courseId)
            .OrderBy(l => l.Order)
            .ToListAsync();

        var target = lessons.FirstOrDefault(l => l.Id == lessonId);
        if (target is null)
            return Error.NotFound("Lesson.NotFound", "Lesson was not found.");

        if (course.Status == CourseStatus.Published && lessons.Count <= 1)
            return Error.Validation("Lesson.MinimumRequired", "A published course must contain at least one lesson.");

        dbContext.Lessons.Remove(target);
        lessons.Remove(target);

        // Normalize remaining order values 1..N
        for (var i = 0; i < lessons.Count; i++)
        {
            lessons[i].Order = i + 1;
        }

        course.UpdatedAt = DateTimeOffset.UtcNow;
        await dbContext.SaveChangesAsync();

        return Result.Deleted;
    }

    public async Task<ErrorOr<List<LessonDetailDto>>> ReorderLessonsAsync(
        Guid courseId,
        Guid teacherId,
        bool isAdmin,
        ReorderLessonsRequest request)
    {
        var course = await dbContext.Courses.FirstOrDefaultAsync(c => c.Id == courseId);
        if (course is null)
            return Error.NotFound("Course.NotFound", "Course was not found.");

        if (!isAdmin && course.TeacherId != teacherId)
            return Error.Forbidden("Course.Forbidden", "You do not have permission to modify this course.");

        if (course.Status == CourseStatus.Suspended && !isAdmin)
            return Error.Validation("Course.Suspended", "Suspended courses cannot be modified.");

        var lessons = await dbContext.Lessons
            .Where(l => l.CourseId == courseId)
            .ToListAsync();

        var distinctIds = request.LessonIds.Distinct().ToList();
        if (distinctIds.Count != lessons.Count || !lessons.All(l => distinctIds.Contains(l.Id)))
            return Error.Validation("Lesson.InvalidOrder", "Reorder list must include every lesson in the course exactly once.");

        var lessonLookup = lessons.ToDictionary(l => l.Id);
        for (var i = 0; i < distinctIds.Count; i++)
        {
            lessonLookup[distinctIds[i]].Order = i + 1;
        }

        course.UpdatedAt = DateTimeOffset.UtcNow;
        await dbContext.SaveChangesAsync();

        return distinctIds
            .Select(id => lessonLookup[id])
            .Select(l => new LessonDetailDto(
                l.Id,
                l.CourseId,
                l.Title,
                l.Order,
                l.Content,
                l.VideoUrl,
                IsCompleted: false
            ))
            .ToList();
    }

    public async Task<ErrorOr<LessonCompletionDto>> ToggleLessonCompletionAsync(
        Guid courseId,
        Guid lessonId,
        Guid studentId,
        bool completed)
    {
        var enrollment = await dbContext.Enrollments
            .FirstOrDefaultAsync(e => e.CourseId == courseId && e.StudentId == studentId);

        if (enrollment is null)
            return Error.Forbidden("Lesson.NotEnrolled", "You must enroll in this course to track lesson progress.");

        var lessonExists = await dbContext.Lessons
            .AsNoTracking()
            .AnyAsync(l => l.Id == lessonId && l.CourseId == courseId);

        if (!lessonExists)
            return Error.NotFound("Lesson.NotFound", "Lesson was not found.");

        var existingProgress = await dbContext.LessonProgress
            .FirstOrDefaultAsync(lp => lp.EnrollmentId == enrollment.Id && lp.LessonId == lessonId);

        if (completed && existingProgress is null)
        {
            dbContext.LessonProgress.Add(new LessonProgress
            {
                Id = Guid.CreateVersion7(),
                EnrollmentId = enrollment.Id,
                LessonId = lessonId,
                CompletedAt = DateTimeOffset.UtcNow
            });
            await dbContext.SaveChangesAsync();
        }
        else if (!completed && existingProgress is not null)
        {
            dbContext.LessonProgress.Remove(existingProgress);
            await dbContext.SaveChangesAsync();
        }

        var totalLessons = await dbContext.Lessons
            .AsNoTracking()
            .CountAsync(l => l.CourseId == courseId);

        var completedLessons = await dbContext.LessonProgress
            .AsNoTracking()
            .CountAsync(lp => lp.EnrollmentId == enrollment.Id);

        var isExamUnlocked = totalLessons > 0 && completedLessons == totalLessons;

        return new LessonCompletionDto(
            lessonId,
            completed,
            completedLessons,
            totalLessons,
            isExamUnlocked
        );
    }

    private static ErrorOr<Success> ValidateVideoUrl(string? videoUrl)
    {
        if (string.IsNullOrWhiteSpace(videoUrl))
            return Result.Success;

        if (!Uri.TryCreate(videoUrl.Trim(), UriKind.Absolute, out var uri) ||
            uri.Scheme != Uri.UriSchemeHttps ||
            !AllowedVideoHosts.Contains(uri.Host))
        {
            return Error.Validation(
                "Lesson.InvalidVideoUrl",
                "Video URL must be a valid HTTPS link from YouTube or Vimeo.");
        }

        return Result.Success;
    }
}