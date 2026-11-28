using System.Text.RegularExpressions;
using ErrorOr;
using Microsoft.EntityFrameworkCore;
using SilicaLab.Api.Data;
using SilicaLab.Api.Dtos;

namespace SilicaLab.Api.Services;

public interface ICertificateService
{
    Task<ErrorOr<List<MyCertificateDto>>> GetMyCertificatesAsync(Guid userId);
    Task<ErrorOr<CertificateVerificationDto>> VerifyCertificateAsync(string code);
}

public partial class CertificateService(AppDbContext dbContext) : ICertificateService
{
    // Pattern for certificate codes
    [GeneratedRegex("^LH-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}$")]
    private static partial Regex CertificateCodeRegex();

    public async Task<ErrorOr<List<MyCertificateDto>>> GetMyCertificatesAsync(Guid userId)
    {
        var certificates = await dbContext.Certificates
            .AsNoTracking()
            .Where(c => c.StudentId == userId)
            .OrderByDescending(c => c.IssuedAt)
            .Select(c => new MyCertificateDto(
                c.Id,
                c.Code,
                c.CourseId,
                c.StudentName,
                c.CourseTitle,
                c.TeacherName,
                c.ScorePercent,
                c.IssuedAt,
                c.RevokedAt != null,
                c.RevokedAt,
                c.RevocationReason
            ))
            .ToListAsync();

        return certificates;
    }

    public async Task<ErrorOr<CertificateVerificationDto>> VerifyCertificateAsync(string code)
    {
        var normalizedCode = code.Trim().ToUpperInvariant();

        if (!CertificateCodeRegex().IsMatch(normalizedCode))
        {
            return Error.Validation("Certificate.InvalidCodeFormat", "Certificate code must match the LH-XXXX-XXXX format.");
        }

        var certificate = await dbContext.Certificates
            .AsNoTracking()
            .Where(c => c.Code == normalizedCode)
            .Select(c => new CertificateVerificationDto(
                c.Code,
                c.RevokedAt == null,
                c.StudentName,
                c.CourseTitle,
                c.TeacherName,
                c.ScorePercent,
                c.IssuedAt,
                c.RevokedAt != null,
                c.RevokedAt,
                c.RevocationReason
            ))
            .FirstOrDefaultAsync();

        if (certificate is null)
        {
            return Error.NotFound("Certificate.NotFound", "No certificate was found for the provided verification code.");
        }

        return certificate;
    }
}