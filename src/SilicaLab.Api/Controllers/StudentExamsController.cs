using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SilicaLab.Api.Common;
using SilicaLab.Api.Dtos;
using SilicaLab.Api.Extensions;

namespace SilicaLab.Api.Controllers;

[ApiController]
[Authorize(Policy = Policies.CanLearn)]
[Route("api")]
public class StudentExamsController(IStudentExamService studentExamService) : ControllerBase
{
    [HttpGet("courses/{courseId:guid}/exam")]
    public async Task<IResult> GetExamOverview(Guid courseId)
    {
        var result = await studentExamService.GetCourseExamOverviewAsync(courseId, GetCurrentUserId());

        return result.Match(
            overview => Results.Ok(overview),
            errors => errors.ToProblem());
    }

    [HttpPost("courses/{courseId:guid}/exam/attempts")]
    public async Task<IResult> StartOrResumeAttempt(Guid courseId)
    {
        var result = await studentExamService.StartOrResumeAttemptAsync(courseId, GetCurrentUserId());

        return result.Match(
            attempt => Results.Ok(attempt),
            errors => errors.ToProblem());
    }

    [HttpGet("exam-attempts/{attemptId:guid}")]
    public async Task<IResult> GetAttemptState(Guid attemptId)
    {
        var result = await studentExamService.GetAttemptStateAsync(attemptId, GetCurrentUserId());

        return result.Match(
            attempt => Results.Ok(attempt),
            errors => errors.ToProblem());
    }

    [HttpPut("exam-attempts/{attemptId:guid}/answers")]
    public async Task<IResult> SaveAnswer(
        Guid attemptId,
        [FromBody] SaveAttemptAnswerRequest request)
    {
        var result = await studentExamService.SaveAnswerAsync(attemptId, GetCurrentUserId(), request);

        return result.Match(
            _ => Results.NoContent(),
            errors => errors.ToProblem());
    }

    [HttpPost("exam-attempts/{attemptId:guid}/submit")]
    public async Task<IResult> SubmitAttempt(Guid attemptId)
    {
        var result = await studentExamService.SubmitAttemptAsync(attemptId, GetCurrentUserId());

        return result.Match(
            summary => Results.Ok(summary),
            errors => errors.ToProblem());
    }

    private Guid GetCurrentUserId()
    {
        var sub = User.FindFirstValue("sub");
        return Guid.Parse(sub!);
    }
}
