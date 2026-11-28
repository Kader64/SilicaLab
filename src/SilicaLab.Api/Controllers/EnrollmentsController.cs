using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SilicaLab.Api.Common;
using SilicaLab.Api.Extensions;
using SilicaLab.Api.Services;

namespace SilicaLab.Api.Controllers;

[ApiController]
[Authorize(Policy = Policies.CanLearn)]
[Route("api")]
public class EnrollmentsController(IEnrollmentService enrollmentService) : ControllerBase
{
    [HttpPost("courses/{courseId:guid}/enroll")]
    public async Task<IResult> Enroll(Guid courseId)
    {
        var result = await enrollmentService.EnrollAsync(GetCurrentUserId(), courseId);

        return result.Match(
            enrollment => Results.Created($"/api/courses/{courseId}", enrollment),
            errors => errors.ToProblem());
    }

    [HttpGet("enrollments/my")]
    public async Task<IResult> GetMyEnrollments()
    {
        var result = await enrollmentService.GetMyEnrollmentsAsync(GetCurrentUserId());

        return result.Match(
            enrollments => Results.Ok(enrollments),
            errors => errors.ToProblem());
    }

    private Guid GetCurrentUserId()
    {
        var sub = User.FindFirstValue("sub");
        return Guid.Parse(sub!);
    }
}