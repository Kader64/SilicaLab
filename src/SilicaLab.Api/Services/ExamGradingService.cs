using System.Security.Cryptography;
using ErrorOr;
using Microsoft.EntityFrameworkCore;
using SilicaLab.Api.Data;
using SilicaLab.Api.Data.Entities;
using SilicaLab.Api.Dtos;

namespace SilicaLab.Api.Services;

public interface IExamGradingService
{
    Task<ErrorOr<ExamAttemptResultDto>> GradeAndFinalizeAsync(Guid attemptId, Guid userId, bool isExpired);
    Task<ErrorOr<ExamAttemptResultDto>> GetAttemptResultAsync(Guid attemptId, Guid userId);
}

public class ExamGradingService(AppDbContext dbContext) : IExamGradingService
{
    private const string CertificateAlphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

    public async Task<ErrorOr<ExamAttemptResultDto>> GradeAndFinalizeAsync(Guid attemptId, Guid userId, bool isExpired)
    {
        var context = await dbContext.ExamAttempts
            .AsNoTracking()
            .Where(a => a.Id == attemptId && a.Enrollment.StudentId == userId)
            .Select(a => new
            {
                a.Id,
                a.Status,
                a.StartedAt,
                a.PassMarkPercent,
                a.Enrollment.CourseId,
                StudentName = a.Enrollment.Student.FullName,
                CourseTitle = a.Enrollment.Course.Title,
                TeacherName = a.Enrollment.Course.Teacher.FullName
            })
            .FirstOrDefaultAsync();

        if (context is null)
            return Error.NotFound("ExamAttempt.NotFound", "Exam attempt was not found.");

        if (context.Status != AttemptStatus.InProgress)
            return await GetAttemptResultAsync(attemptId, userId);

        var stats = await dbContext.AttemptAnswers
            .AsNoTracking()
            .Where(aa => aa.AttemptId == attemptId)
            .GroupBy(_ => 1)
            .Select(g => new
            {
                Total = g.Count(),
                Correct = g.Count(aa => aa.SelectedAnswerId != null && aa.SelectedAnswer!.IsCorrect)
            })
            .FirstOrDefaultAsync();

        var totalQuestions = stats?.Total ?? 0;
        var correctCount = stats?.Correct ?? 0;
        var scorePercent = totalQuestions > 0
            ? Math.Round((decimal)correctCount / totalQuestions * 100m, 2, MidpointRounding.AwayFromZero)
            : 0m;

        var passed = scorePercent >= context.PassMarkPercent;
        var targetStatus = isExpired ? AttemptStatus.Expired : AttemptStatus.Submitted;
        var submittedAt = DateTimeOffset.UtcNow;

        var updatedRows = await dbContext.ExamAttempts
            .Where(a => a.Id == attemptId && a.Status == AttemptStatus.InProgress)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(a => a.Status, targetStatus)
                .SetProperty(a => a.SubmittedAt, submittedAt)
                .SetProperty(a => a.ScorePercent, scorePercent)
                .SetProperty(a => a.Passed, passed));

        if (updatedRows == 0)
            return await GetAttemptResultAsync(attemptId, userId);

        string? certificateCode = null;
        if (passed)
        {
            certificateCode = await EnsureCertificateAsync(
                userId,
                context.CourseId,
                attemptId,
                context.StudentName,
                context.CourseTitle,
                context.TeacherName,
                scorePercent,
                submittedAt);
        }

        return new ExamAttemptResultDto(
            attemptId,
            context.CourseId,
            targetStatus.ToString(),
            context.StartedAt,
            submittedAt,
            context.PassMarkPercent,
            correctCount,
            totalQuestions,
            scorePercent,
            passed,
            certificateCode
        );
    }

    public async Task<ErrorOr<ExamAttemptResultDto>> GetAttemptResultAsync(Guid attemptId, Guid userId)
    {
        var data = await dbContext.ExamAttempts
            .AsNoTracking()
            .Where(a => a.Id == attemptId && a.Enrollment.StudentId == userId)
            .Select(a => new
            {
                a.Id,
                a.Enrollment.CourseId,
                a.Status,
                a.StartedAt,
                a.SubmittedAt,
                a.PassMarkPercent,
                a.ScorePercent,
                a.Passed,
                TotalQuestions = a.AttemptAnswers.Count,
                CorrectAnswers = a.AttemptAnswers.Count(aa => aa.SelectedAnswerId != null && aa.SelectedAnswer!.IsCorrect),
                CertificateCode = dbContext.Certificates
                    .Where(c => c.StudentId == userId && c.CourseId == a.Enrollment.CourseId && c.RevokedAt == null)
                    .Select(c => c.Code)
                    .FirstOrDefault()
            })
            .FirstOrDefaultAsync();

        if (data is null)
            return Error.NotFound("ExamAttempt.NotFound", "Exam attempt was not found.");

        return new ExamAttemptResultDto(
            data.Id,
            data.CourseId,
            data.Status.ToString(),
            data.StartedAt,
            data.SubmittedAt,
            data.PassMarkPercent,
            data.CorrectAnswers,
            data.TotalQuestions,
            data.ScorePercent ?? 0m,
            data.Passed ?? false,
            data.CertificateCode
        );
    }

    private async Task<string?> EnsureCertificateAsync(
        Guid studentId,
        Guid courseId,
        Guid attemptId,
        string studentName,
        string courseTitle,
        string teacherName,
        decimal scorePercent,
        DateTimeOffset issuedAt)
    {
        var existing = await dbContext.Certificates
            .AsNoTracking()
            .Where(c => c.StudentId == studentId && c.CourseId == courseId)
            .Select(c => new { c.Code, c.RevokedAt })
            .FirstOrDefaultAsync();

        if (existing is not null)
            return existing.RevokedAt is null ? existing.Code : null;

        for (var retry = 0; retry < 5; retry++)
        {
            var code = GenerateCode();
            var certificate = new Certificate
            {
                Id = Guid.CreateVersion7(),
                Code = code,
                StudentId = studentId,
                CourseId = courseId,
                AttemptId = attemptId,
                StudentName = studentName,
                CourseTitle = courseTitle,
                TeacherName = teacherName,
                ScorePercent = scorePercent,
                IssuedAt = issuedAt
            };

            dbContext.Certificates.Add(certificate);

            try
            {
                await dbContext.SaveChangesAsync();
                return code;
            }
            catch (DbUpdateException)
            {
                dbContext.Entry(certificate).State = EntityState.Detached;

                var raceWinner = await dbContext.Certificates
                    .AsNoTracking()
                    .Where(c => c.StudentId == studentId && c.CourseId == courseId)
                    .Select(c => new { c.Code, c.RevokedAt })
                    .FirstOrDefaultAsync();

                if (raceWinner is not null)
                    return raceWinner.RevokedAt is null ? raceWinner.Code : null;
            }
        }

        throw new InvalidOperationException("Failed to generate a unique certificate code.");
    }

    private static string GenerateCode()
    {
        Span<char> chars = stackalloc char[8];
        for (var i = 0; i < chars.Length; i++)
        {
            chars[i] = CertificateAlphabet[RandomNumberGenerator.GetInt32(CertificateAlphabet.Length)];
        }
        return $"LH-{chars[..4]}-{chars[4..]}";
    }
}