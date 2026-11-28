using System.Security.Cryptography;
using ErrorOr;
using Microsoft.EntityFrameworkCore;
using SilicaLab.Api.Data;
using SilicaLab.Api.Data.Entities;
using SilicaLab.Api.Dtos;
using SilicaLab.Api.Services;

public interface IStudentExamService
{
    Task<ErrorOr<StudentExamOverviewDto>> GetCourseExamOverviewAsync(Guid courseId, Guid userId);
    Task<ErrorOr<ActiveExamAttemptDto>> StartOrResumeAttemptAsync(Guid courseId, Guid userId);
    Task<ErrorOr<ActiveExamAttemptDto>> GetAttemptStateAsync(Guid attemptId, Guid userId);
    Task<ErrorOr<Success>> SaveAnswerAsync(Guid attemptId, Guid userId, SaveAttemptAnswerRequest request);
    Task<ErrorOr<ExamAttemptResultDto>> SubmitAttemptAsync(Guid attemptId, Guid userId);
}

public class StudentExamService(AppDbContext dbContext, IExamGradingService gradingService) : IStudentExamService
{
    private static readonly TimeSpan NetworkSubmitGracePeriod = TimeSpan.FromSeconds(5);

    public async Task<ErrorOr<StudentExamOverviewDto>> GetCourseExamOverviewAsync(Guid courseId, Guid userId)
    {
        var enrollment = await dbContext.Enrollments
            .AsNoTracking()
            .Where(e => e.CourseId == courseId && e.StudentId == userId)
            .Select(e => new
            {
                e.Id,
                CourseTitle = e.Course.Title,
                CourseStatus = e.Course.Status,
                TotalLessons = e.Course.Lessons.Count,
                CompletedLessons = e.LessonProgress.Count,
                Exam = e.Course.Exam == null
                    ? null
                    : new
                    {
                        e.Course.Exam.Id,
                        e.Course.Exam.PassMarkPercent,
                        e.Course.Exam.TimeLimitMinutes,
                        e.Course.Exam.MaxAttempts,
                        ActiveQuestionsCount = e.Course.Exam.Questions.Count(q => !q.IsArchived)
                    }
            })
            .FirstOrDefaultAsync();

        if (enrollment is null)
            return Error.Forbidden("Exam.NotEnrolled", "You must enroll in this course before viewing its exam.");

        if (enrollment.Exam is null)
            return Error.NotFound("Exam.NotFound", "This course does not have an exam yet.");

        await FinalizeExpiredAttemptsAsync(enrollment.Id, userId);

        var attempts = await dbContext.ExamAttempts
            .AsNoTracking()
            .Where(a => a.EnrollmentId == enrollment.Id && a.ExamId == enrollment.Exam.Id)
            .OrderByDescending(a => a.StartedAt)
            .Select(a => new ExamAttemptSummaryDto(
                a.Id,
                a.Status.ToString(),
                a.StartedAt,
                a.ExpiresAt,
                a.SubmittedAt,
                a.PassMarkPercent,
                a.ScorePercent,
                a.Passed,
                a.Certificate != null && a.Certificate.RevokedAt == null ? a.Certificate.Code : null
            ))
            .ToListAsync();

        var certificateCode = await dbContext.Certificates
            .AsNoTracking()
            .Where(c => c.StudentId == userId && c.CourseId == courseId && c.RevokedAt == null)
            .Select(c => c.Code)
            .FirstOrDefaultAsync();

        var isUnlocked = enrollment.TotalLessons > 0 && enrollment.CompletedLessons >= enrollment.TotalLessons;
        var activeAttempt = attempts.FirstOrDefault(a => a.Status == nameof(AttemptStatus.InProgress));
        int? remainingAttempts = enrollment.Exam.MaxAttempts.HasValue
            ? Math.Max(0, enrollment.Exam.MaxAttempts.Value - attempts.Count)
            : null;

        var canStartNewAttempt =
            isUnlocked &&
            enrollment.CourseStatus == CourseStatus.Published &&
            enrollment.Exam.ActiveQuestionsCount > 0 &&
            activeAttempt is null &&
            (!remainingAttempts.HasValue || remainingAttempts.Value > 0);

        return new StudentExamOverviewDto(
            enrollment.Exam.Id,
            courseId,
            enrollment.CourseTitle,
            enrollment.Exam.PassMarkPercent,
            enrollment.Exam.TimeLimitMinutes,
            enrollment.Exam.MaxAttempts,
            enrollment.Exam.ActiveQuestionsCount,
            isUnlocked,
            enrollment.CompletedLessons,
            enrollment.TotalLessons,
            attempts.Count,
            remainingAttempts,
            canStartNewAttempt,
            activeAttempt?.AttemptId,
            attempts.Any(a => a.Passed == true),
            certificateCode,
            attempts
        );
    }

    public async Task<ErrorOr<ActiveExamAttemptDto>> StartOrResumeAttemptAsync(Guid courseId, Guid userId)
    {
        var enrollment = await dbContext.Enrollments
            .AsNoTracking()
            .Where(e => e.CourseId == courseId && e.StudentId == userId)
            .Select(e => new
            {
                e.Id,
                CourseStatus = e.Course.Status,
                TotalLessons = e.Course.Lessons.Count,
                CompletedLessons = e.LessonProgress.Count,
                Exam = e.Course.Exam == null
                    ? null
                    : new
                    {
                        e.Course.Exam.Id,
                        e.Course.Exam.PassMarkPercent,
                        e.Course.Exam.TimeLimitMinutes,
                        e.Course.Exam.MaxAttempts
                    }
            })
            .FirstOrDefaultAsync();

        if (enrollment is null)
            return Error.Forbidden("Exam.NotEnrolled", "You must enroll in this course to take the exam.");

        if (enrollment.Exam is null)
            return Error.NotFound("Exam.NotFound", "This course does not have an exam.");

        if (enrollment.CourseStatus != CourseStatus.Published)
            return Error.Validation("Course.NotPublished", "Exam attempts can only be started on published courses.");

        if (enrollment.TotalLessons == 0 || enrollment.CompletedLessons < enrollment.TotalLessons)
            return Error.Validation("Exam.Locked", "Complete all course lessons before starting the exam.");

        await FinalizeExpiredAttemptsAsync(enrollment.Id, userId);

        var existingInProgressId = await dbContext.ExamAttempts
            .AsNoTracking()
            .Where(a => a.EnrollmentId == enrollment.Id && a.Status == AttemptStatus.InProgress)
            .Select(a => (Guid?)a.Id)
            .FirstOrDefaultAsync();

        if (existingInProgressId.HasValue)
            return await GetAttemptStateAsync(existingInProgressId.Value, userId);

        if (enrollment.Exam.MaxAttempts.HasValue)
        {
            var attemptsCount = await dbContext.ExamAttempts
                .AsNoTracking()
                .CountAsync(a => a.EnrollmentId == enrollment.Id && a.ExamId == enrollment.Exam.Id);

            if (attemptsCount >= enrollment.Exam.MaxAttempts.Value)
                return Error.Validation("Exam.MaxAttemptsReached", "You have reached the maximum number of attempts for this exam.");
        }

        var activeQuestionIds = await dbContext.Questions
            .AsNoTracking()
            .Where(q => q.ExamId == enrollment.Exam.Id && !q.IsArchived)
            .OrderBy(q => q.Order)
            .Select(q => q.Id)
            .ToListAsync();

        if (activeQuestionIds.Count == 0)
            return Error.Validation("Exam.NoQuestions", "This exam has no active questions.");

        var now = DateTimeOffset.UtcNow;
        var attempt = new ExamAttempt
        {
            Id = Guid.CreateVersion7(),
            EnrollmentId = enrollment.Id,
            ExamId = enrollment.Exam.Id,
            Status = AttemptStatus.InProgress,
            StartedAt = now,
            ExpiresAt = enrollment.Exam.TimeLimitMinutes.HasValue
                ? now.AddMinutes(enrollment.Exam.TimeLimitMinutes.Value)
                : null,
            ShuffleSeed = RandomNumberGenerator.GetInt32(1, int.MaxValue),
            PassMarkPercent = enrollment.Exam.PassMarkPercent,
            AttemptAnswers = activeQuestionIds.ConvertAll(qId => new AttemptAnswer
            {
                Id = Guid.CreateVersion7(),
                QuestionId = qId,
                SelectedAnswerId = null
            })
        };

        try
        {
            dbContext.ExamAttempts.Add(attempt);
            await dbContext.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            dbContext.Entry(attempt).State = EntityState.Detached;

            var concurrentId = await dbContext.ExamAttempts
                .AsNoTracking()
                .Where(a => a.EnrollmentId == enrollment.Id && a.Status == AttemptStatus.InProgress)
                .Select(a => (Guid?)a.Id)
                .FirstOrDefaultAsync();

            if (concurrentId.HasValue)
                return await GetAttemptStateAsync(concurrentId.Value, userId);

            throw;
        }

        return await GetAttemptStateAsync(attempt.Id, userId);
    }

    public async Task<ErrorOr<ActiveExamAttemptDto>> GetAttemptStateAsync(Guid attemptId, Guid userId)
    {
        var attempt = await dbContext.ExamAttempts
            .AsNoTracking()
            .Where(a => a.Id == attemptId && a.Enrollment.StudentId == userId)
            .Select(a => new
            {
                a.Id,
                a.ExamId,
                a.Enrollment.CourseId,
                CourseTitle = a.Enrollment.Course.Title,
                a.Status,
                a.StartedAt,
                a.ExpiresAt,
                a.ShuffleSeed,
                a.PassMarkPercent
            })
            .FirstOrDefaultAsync();

        if (attempt is null)
            return Error.NotFound("ExamAttempt.NotFound", "Exam attempt was not found.");

        if (attempt.Status == AttemptStatus.InProgress &&
            attempt.ExpiresAt.HasValue &&
            DateTimeOffset.UtcNow >= attempt.ExpiresAt.Value)
        {
            await gradingService.GradeAndFinalizeAsync(attempt.Id, userId, isExpired: true);
            return Error.Validation("ExamAttempt.Expired", "Time limit expired. Your attempt has been automatically submitted.");
        }

        if (attempt.Status != AttemptStatus.InProgress)
            return Error.Validation("ExamAttempt.AlreadySubmitted", "This attempt has already been submitted.");

        var rows = await dbContext.AttemptAnswers
            .AsNoTracking()
            .Where(aa => aa.AttemptId == attemptId)
            .Select(aa => new
            {
                aa.QuestionId,
                QuestionText = aa.Question.Text,
                QuestionOrder = aa.Question.Order,
                aa.SelectedAnswerId,
                Answers = aa.Question.Answers
                    .Where(ans => !ans.IsArchived || ans.Id == aa.SelectedAnswerId)
                    .OrderBy(ans => ans.Order)
                    .Select(ans => new ExamAnswerOptionDto(ans.Id, ans.Text))
                    .ToList()
            })
            .OrderBy(r => r.QuestionOrder)
            .ToListAsync();

        var rng = new Random(attempt.ShuffleSeed);
        var shuffledQuestions = DeterministicShuffle(rows, rng)
            .ConvertAll(r => new ExamQuestionDto(
                r.QuestionId,
                r.QuestionText,
                r.SelectedAnswerId,
                DeterministicShuffle(r.Answers, rng)
            ));

        return new ActiveExamAttemptDto(
            attempt.Id,
            attempt.ExamId,
            attempt.CourseId,
            attempt.CourseTitle,
            attempt.Status.ToString(),
            attempt.StartedAt,
            attempt.ExpiresAt,
            attempt.PassMarkPercent,
            shuffledQuestions
        );
    }

    public async Task<ErrorOr<Success>> SaveAnswerAsync(
        Guid attemptId,
        Guid userId,
        SaveAttemptAnswerRequest request)
    {
        var target = await dbContext.AttemptAnswers
            .AsNoTracking()
            .Where(aa =>
                aa.AttemptId == attemptId &&
                aa.Attempt.Enrollment.StudentId == userId &&
                aa.QuestionId == request.QuestionId)
            .Select(aa => new
            {
                AttemptAnswerId = aa.Id,
                aa.Attempt.Status,
                aa.Attempt.ExpiresAt,
                IsAnswerValid = request.SelectedAnswerId == null ||
                    aa.Question.Answers.Any(ans => ans.Id == request.SelectedAnswerId && !ans.IsArchived)
            })
            .FirstOrDefaultAsync();

        if (target is null)
            return Error.NotFound("ExamAttempt.NotFound", "Exam attempt or question was not found.");

        if (target.Status != AttemptStatus.InProgress)
            return Error.Validation("ExamAttempt.Closed", "Cannot modify answers on a completed attempt.");

        if (target.ExpiresAt.HasValue && DateTimeOffset.UtcNow >= target.ExpiresAt.Value)
        {
            await gradingService.GradeAndFinalizeAsync(attemptId, userId, isExpired: true);
            return Error.Validation("ExamAttempt.Expired", "Time limit expired. Your attempt has been automatically submitted.");
        }

        if (!target.IsAnswerValid)
            return Error.Validation("ExamAttempt.InvalidAnswer", "Selected answer is not valid for this question.");

        await dbContext.AttemptAnswers
            .Where(aa => aa.Id == target.AttemptAnswerId)
            .ExecuteUpdateAsync(s => s.SetProperty(aa => aa.SelectedAnswerId, request.SelectedAnswerId));

        return Result.Success;
    }

    public async Task<ErrorOr<ExamAttemptResultDto>> SubmitAttemptAsync(Guid attemptId, Guid userId)
    {
        var attempt = await dbContext.ExamAttempts
            .AsNoTracking()
            .Where(a => a.Id == attemptId && a.Enrollment.StudentId == userId)
            .Select(a => new { a.Id, a.Status, a.ExpiresAt })
            .FirstOrDefaultAsync();

        if (attempt is null)
            return Error.NotFound("ExamAttempt.NotFound", "Exam attempt was not found.");

        if (attempt.Status != AttemptStatus.InProgress)
            return await gradingService.GetAttemptResultAsync(attempt.Id, userId);

        var isExpired = attempt.ExpiresAt.HasValue &&
            DateTimeOffset.UtcNow > attempt.ExpiresAt.Value.Add(NetworkSubmitGracePeriod);

        return await gradingService.GradeAndFinalizeAsync(attempt.Id, userId, isExpired);
    }

    private async Task FinalizeExpiredAttemptsAsync(Guid enrollmentId, Guid userId)
    {
        var now = DateTimeOffset.UtcNow;
        var expiredIds = await dbContext.ExamAttempts
            .AsNoTracking()
            .Where(a =>
                a.EnrollmentId == enrollmentId &&
                a.Status == AttemptStatus.InProgress &&
                a.ExpiresAt != null &&
                a.ExpiresAt <= now)
            .Select(a => a.Id)
            .ToListAsync();

        foreach (var expiredId in expiredIds)
        {
            await gradingService.GradeAndFinalizeAsync(expiredId, userId, isExpired: true);
        }
    }

    private static List<T> DeterministicShuffle<T>(IReadOnlyList<T> source, Random rng)
    {
        var list = source.ToList();
        for (var i = list.Count - 1; i > 0; i--)
        {
            var j = rng.Next(i + 1);
            (list[i], list[j]) = (list[j], list[i]);
        }
        return list;
    }
}