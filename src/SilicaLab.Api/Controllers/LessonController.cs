using SilicaLab.Api.Dtos;
namespace SilicaLab.Api.Controllers;

using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SilicaLab.Api.Common;
using SilicaLab.Api.Extensions;
using SilicaLab.Api.Services;

[ApiController]
[Authorize]
[Route("api/courses/{courseId:guid}/lessons")]
public class LessonsController(ILessonService lessonService) : ControllerBase
{
    [HttpGet]
    public async Task<IResult> GetCourseLessons(Guid courseId)
    {
        var userId = GetCurrentUserId();
        var isAdmin = User.IsInRole(Roles.Admin);

        var result = await lessonService.GetCourseLessonsAsync(courseId, userId, isAdmin);

        return result.Match(
            lessons => Results.Ok(lessons),
            errors => errors.ToProblem());
    }

    [HttpGet("{lessonId:guid}")]
    public async Task<IResult> GetLessonById(Guid courseId, Guid lessonId)
    {
        var userId = GetCurrentUserId();
        var isAdmin = User.IsInRole(Roles.Admin);

        var result = await lessonService.GetLessonByIdAsync(courseId, lessonId, userId, isAdmin);

        return result.Match(
            lesson => Results.Ok(lesson),
            errors => errors.ToProblem());
    }

    [HttpPost]
    [Authorize(Policy = Policies.CanTeach)]
    public async Task<IResult> CreateLesson(Guid courseId, [FromBody] CreateLessonRequest request)
    {
        var userId = GetCurrentUserId();
        var isAdmin = User.IsInRole(Roles.Admin);

        var result = await lessonService.CreateLessonAsync(courseId, userId, isAdmin, request);

        return result.Match(
            lesson => Results.Created($"/api/courses/{courseId}/lessons/{lesson.Id}", lesson),
            errors => errors.ToProblem());
    }

    [HttpPut("{lessonId:guid}")]
    [Authorize(Policy = Policies.CanTeach)]
    public async Task<IResult> UpdateLesson(Guid courseId, Guid lessonId, [FromBody] UpdateLessonRequest request)
    {
        var userId = GetCurrentUserId();
        var isAdmin = User.IsInRole(Roles.Admin);

        var result = await lessonService.UpdateLessonAsync(courseId, lessonId, userId, isAdmin, request);

        return result.Match(
            lesson => Results.Ok(lesson),
            errors => errors.ToProblem());
    }

    [HttpDelete("{lessonId:guid}")]
    [Authorize(Policy = Policies.CanTeach)]
    public async Task<IResult> DeleteLesson(Guid courseId, Guid lessonId)
    {
        var userId = GetCurrentUserId();
        var isAdmin = User.IsInRole(Roles.Admin);

        var result = await lessonService.DeleteLessonAsync(courseId, lessonId, userId, isAdmin);

        return result.Match(
            _ => Results.NoContent(),
            errors => errors.ToProblem());
    }

    [HttpPut("reorder")]
    [Authorize(Policy = Policies.CanTeach)]
    public async Task<IResult> ReorderLessons(Guid courseId, [FromBody] ReorderLessonsRequest request)
    {
        var userId = GetCurrentUserId();
        var isAdmin = User.IsInRole("Admin");

        var result = await lessonService.ReorderLessonsAsync(courseId, userId, isAdmin, request);

        return result.Match(
            lessons => Results.Ok(lessons),
            errors => errors.ToProblem());
    }

    [HttpPost("{lessonId:guid}/complete")]
    [Authorize(Policy = Policies.CanLearn)]
    public async Task<IResult> MarkLessonComplete(Guid courseId, Guid lessonId)
    {
        var userId = GetCurrentUserId();
        var result = await lessonService.ToggleLessonCompletionAsync(courseId, lessonId, userId, completed: true);

        return result.Match(
            progress => Results.Ok(progress),
            errors => errors.ToProblem());
    }

    [HttpDelete("{lessonId:guid}/complete")]
    [Authorize(Policy = Policies.CanLearn)]
    public async Task<IResult> UnmarkLessonComplete(Guid courseId, Guid lessonId)
    {
        var userId = GetCurrentUserId();
        var result = await lessonService.ToggleLessonCompletionAsync(courseId, lessonId, userId, completed: false);

        return result.Match(
            progress => Results.Ok(progress),
            errors => errors.ToProblem());
    }

    private Guid GetCurrentUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.Parse(sub!);
    }
}