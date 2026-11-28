using ErrorOr;
using Microsoft.EntityFrameworkCore;
using SilicaLab.Api.Data;
using SilicaLab.Api.Data.Entities;
using SilicaLab.Api.Dtos;

namespace SilicaLab.Api.Services;

public interface IEnrollmentService
{
    Task<ErrorOr<EnrollResponseDto>> EnrollAsync(Guid userId, Guid courseId);
    Task<ErrorOr<List<MyEnrollmentDto>>> GetMyEnrollmentsAsync(Guid userId);
}

public class EnrollmentService(AppDbContext dbContext) : IEnrollmentService
{
    public async Task<ErrorOr<EnrollResponseDto>> EnrollAsync(Guid userId, Guid courseId)
    {
        var course = await dbContext.Courses
            .AsNoTracking()
            .Where(c => c.Id == courseId)
            .Select(c => new
            {
                c.Id,
                c.Status,
                c.TeacherId
            })
            .FirstOrDefaultAsync();

        if (course is null)
            return Error.NotFound("Course.NotFound", "Course was not found.");

        if (course.Status != CourseStatus.Published)
            return Error.Validation("Course.NotPublished", "You can only enroll in published courses.");

        if (course.TeacherId == userId)
            return Error.Validation("Enrollment.OwnCourse", "You cannot enroll in your own course.");

        var alreadyEnrolled = await dbContext.Enrollments
            .AsNoTracking()
            .AnyAsync(e => e.StudentId == userId && e.CourseId == courseId);

        if (alreadyEnrolled)
            return Error.Conflict("Enrollment.AlreadyEnrolled", "You are already enrolled in this course.");

        var enrollment = new Enrollment
        {
            Id = Guid.CreateVersion7(),
            StudentId = userId,
            CourseId = courseId,
            EnrolledAt = DateTimeOffset.UtcNow
        };

        dbContext.Enrollments.Add(enrollment);
        await dbContext.SaveChangesAsync();

        return new EnrollResponseDto(
            enrollment.Id,
            enrollment.CourseId,
            enrollment.EnrolledAt
        );
    }

    public async Task<ErrorOr<List<MyEnrollmentDto>>> GetMyEnrollmentsAsync(Guid userId)
    {
        var certificatesByCourse = await dbContext.Certificates
            .AsNoTracking()
            .Where(c => c.StudentId == userId && c.RevokedAt == null)
            .Select(c => new { c.CourseId, c.Code })
            .ToDictionaryAsync(c => c.CourseId, c => c.Code);

        var enrollments = await dbContext.Enrollments
            .AsNoTracking()
            .Where(e => e.StudentId == userId)
            .OrderByDescending(e => e.EnrolledAt)
            .Select(e => new
            {
                e.Id,
                e.CourseId,
                e.Course.Title,
                Category = e.Course.Category.Name,
                Teacher = e.Course.Teacher.FullName,
                e.Course.Level,
                e.Course.CoverType,
                e.Course.CoverGradient,
                e.Course.CoverIcon,
                e.Course.ThumbnailUrl,
                TotalLessons = e.Course.Lessons.Count,
                CompletedLessons = e.LessonProgress.Count,
                HasPassedExam = e.ExamAttempts.Any(a => a.Passed == true),
                e.EnrolledAt
            })
            .ToListAsync();

        return enrollments
            .ConvertAll(e =>
            {
                certificatesByCourse.TryGetValue(e.CourseId, out var certificateCode);

                return new MyEnrollmentDto(
                    e.Id,
                    e.CourseId,
                    e.Title,
                    e.Category,
                    e.Teacher,
                    e.Level.ToString(),
                    e.CoverType.ToString(),
                    e.CoverGradient,
                    e.CoverIcon,
                    e.ThumbnailUrl,
                    e.TotalLessons,
                    e.CompletedLessons,
                    IsExamUnlocked: e.TotalLessons > 0 && e.CompletedLessons >= e.TotalLessons,
                    e.HasPassedExam,
                    certificateCode,
                    e.EnrolledAt
                );
            })
;
    }
}